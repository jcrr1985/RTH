/**
 * Geolocalização do navegador, à prova de um comportamento estranho do Chrome.
 *
 * Observado em Chrome (macOS): `getCurrentPosition` chama PRIMEIRO o callback
 * de erro ("User denied Geolocation", code 1, ~40 ms) e logo a seguir o de
 * sucesso (~40 ms depois), mesmo com a permissão concedida. Quem trata o
 * erro de imediato mostra "não foi possível obter a localização" quando a
 * posição acabou de chegar.
 *
 * Aqui um erro só é dado como definitivo se nenhuma posição chegar durante
 * um curto período de tolerância; se chegar, a posição ganha.
 */
export function getPosition({ timeout = 15_000, maximumAge = 300_000, grace = 1_500 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = new Error('Geolocation not supported');
      err.code = 0;
      reject(err);
      return;
    }

    let settled = false;
    let errorTimer = null;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(errorTimer);
      fn(value);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => settle(resolve, pos),
      (err) => {
        errorTimer = setTimeout(() => settle(reject, err), grace);
      },
      { timeout, maximumAge }
    );
  });
}

export const PERMISSION_DENIED = 1;
