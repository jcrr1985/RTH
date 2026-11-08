/**
 * Cliente da API Run To Health.
 *
 * Toda a comunicação com serviços externos passa pelo nosso servidor. O cliente
 * nunca fala diretamente com Nominatim, Overpass ou OSRM — e nunca transporta
 * chaves de API.
 *
 * Na v1 o browser tinha uma chave Google escrita no código em três ficheiros e
 * construía URLs da Google Maps API que depois passava ao nosso proxy. Isso
 * acabou.
 */

const BASE_URL = (
  import.meta.env.VITE_API_URL ?? ''
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(
      'Não foi possível contactar o servidor. Verifique a sua ligação.',
      { code: 'NETWORK_ERROR' }
    );
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError('O servidor devolveu uma resposta inesperada.', {
        status: res.status,
        code: 'BAD_RESPONSE',
      });
    }
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error?.message || `Erro ${res.status} do servidor.`,
      { status: res.status, code: data?.error?.code }
    );
  }
  return data;
}

/* ────────────────────────── unidades de saúde ────────────────────────── */

export function searchHealthcare({ speciality, city, country = 'Portugal', limit, language = 'pt' }, signal) {
  const q = new URLSearchParams();
  if (speciality) q.set('speciality', speciality);
  if (city) q.set('city', city);
  if (country) q.set('country', country);
  if (limit) q.set('limit', String(limit));
  q.set('language', language);
  return request(`/api/healthcare?${q}`, { signal });
}

export function searchNearby({ lat, lng, radius = 10000, speciality, limit, language = 'pt' }, signal) {
  const q = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    language,
  });
  if (speciality) q.set('speciality', speciality);
  if (limit) q.set('limit', String(limit));
  return request(`/api/healthcare/nearby?${q}`, { signal });
}

export function geocode(query, signal) {
  return request(`/api/geocode?q=${encodeURIComponent(query)}`, { signal });
}

export function reverseGeocode(lat, lng, signal) {
  return request(`/api/reverse-geocode?lat=${lat}&lng=${lng}`, { signal });
}

export function getSpecialities(signal) {
  return request('/api/specialities', { signal });
}

/* ───────────────────────── motor de direitos ─────────────────────────── */

export function getRightsOptions(language = 'pt', signal) {
  return request(`/api/rights/options?language=${encodeURIComponent(language)}`, { signal });
}

export function getLanguages(signal) {
  return request('/api/languages', { signal });
}

export function assessRights(payload, signal) {
  return request('/api/rights/assess', { method: 'POST', body: payload, signal });
}

/* ──────────────────────────── vale cirurgia ──────────────────────────── */

export function rankValeOptions({ hospitalNames, origin, language = 'pt' }, signal) {
  return request('/api/vale-cirurgia/rank', {
    method: 'POST',
    body: { hospitalNames, origin, language },
    signal,
  });
}

/* ───────────────────────────── orientação ────────────────────────────── */

export function getOrientation({ description, language = 'pt' }, signal) {
  return request('/api/orientation', {
    method: 'POST',
    body: { description, language },
    signal,
  });
}

export function health(signal) {
  return request('/api/health', { signal });
}
