/**
 * Mapa — Leaflet + tiles do OpenStreetMap.
 *
 * SUBSTITUI A GOOGLE MAPS JS API. Sem chave, sem faturação.
 *
 * Bugs da v1 que isto corrige, não por acaso mas porque eram consequência da
 * abordagem imperativa dentro do React:
 *
 *  1. `let infoPanel = document.getElementById("panel")` corria no momento em
 *     que o módulo era avaliado — antes de o React renderizar. Era sempre
 *     `null`, logo `showPanel()` rebentava em cada clique num marcador.
 *  2. `new google.maps.Map(...)` era chamado dentro do fetch, criando um mapa
 *     novo a cada pesquisa e perdendo o estado anterior.
 *  3. `map.fitBounds(bounds)` era chamado dentro do forEach e logo seguido de
 *     `map.setZoom(8)`, que anulava o enquadramento. O zoom era sempre 8.
 *  4. Os popups eram construídos com `document.createElement`, fora da árvore
 *     do React.
 *
 * Aqui o mapa é criado uma vez, os marcadores são reconciliados a cada
 * alteração de props, e o enquadramento é feito uma só vez por conjunto.
 */

import { useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Os ícones por omissão do Leaflet partem-se com bundlers porque referenciam
// caminhos relativos. Desenhamos os nossos com divIcon, que não depende de
// ficheiros de imagem.
function markerIcon({ selected = false, kind = 'clinic' } = {}) {
  const palette = {
    clinic: '#0d7a6f',
    hospital: '#b0304a',
    user: '#1565c0',
  };
  const color = palette[kind] || palette.clinic;
  const size = selected ? 34 : 26;

  return L.divIcon({
    className: 'rth-marker',
    html: `<span style="
      display:block;width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 0;
      background:${color};
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.4);
      transform:rotate(-45deg);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

/** Conteúdo do popup. Escapado à mão porque o Leaflet aceita HTML. */
function popupHtml(place) {
  const rows = [];
  if (place.address) rows.push(escapeHtml(place.address));
  if (place.phone) {
    rows.push(
      `<a href="tel:${escapeHtml(place.phone)}">${escapeHtml(place.phone)}</a>`
    );
  }
  if (place.website) {
    rows.push(
      `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener noreferrer">Site</a>`
    );
  }
  if (place.travel?.durationText) {
    rows.push(
      `${escapeHtml(place.travel.durationText)} de carro` +
        (place.travel.distanceText ? ` · ${escapeHtml(place.travel.distanceText)}` : '')
    );
  }
  if (place.openingHours) rows.push(escapeHtml(place.openingHours));

  return (
    `<strong>${escapeHtml(place.name || 'Unidade de saúde')}</strong>` +
    (rows.length ? `<br/>${rows.join('<br/>')}` : '')
  );
}

/** Enquadra os pontos. Sem animação: queremos o estado final de imediato. */
function applyFit(map, points) {
  if (points.length === 1) {
    map.setView(points[0], 14, { animate: false });
  } else if (points.length > 1) {
    // padding evita marcadores colados à borda; maxZoom evita ampliar
    // demasiado quando dois pontos estão muito próximos.
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15, animate: false });
  }
}

function LeafletMap({
  places = [],
  userPosition = null,
  selectedId = null,
  onSelect,
  center = [39.5, -8.0], // Portugal continental
  zoom = 7,
  height = 420,
  routeTo = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  // Assinatura do conjunto de marcadores: só reenquadramos quando muda, para
  // não lutar com o utilizador enquanto ele navega no mapa.
  const lastFitKeyRef = useRef(null);
  // Pontos do último enquadramento e se o utilizador já mexeu no mapa. Ver o
  // ResizeObserver abaixo: o enquadramento feito com o contentor ainda sem
  // tamanho final deixava os marcadores fora da vista (era preciso afastar o
  // zoom para os encontrar).
  const fitPointsRef = useRef(null);
  const userMovedRef = useRef(false);

  /* ── criação, uma única vez ── */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return undefined;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false, // não roubar o scroll da página
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      // A atribuição é obrigatória pela licença ODbL.
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Permite voltar a ativar o scroll com um clique, sem o prender por omissão.
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // O contentor pode ainda estar a dimensionar quando o mapa é criado (grelha
    // flex, separadores, fontes a carregar). Se o enquadramento correr com o
    // tamanho errado, os marcadores ficam fora da vista. Por isso, sempre que
    // o tamanho muda, recalcula-se — a não ser que o utilizador já tenha
    // mexido no mapa, para não lutar com ele.
    const container = containerRef.current;
    const markMoved = () => {
      userMovedRef.current = true;
    };
    ['mousedown', 'touchstart', 'wheel'].forEach((ev) =>
      container.addEventListener(ev, markMoved, { passive: true })
    );
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      if (!userMovedRef.current && fitPointsRef.current) {
        applyFit(map, fitPointsRef.current);
      }
    });
    resizeObserver.observe(container);
    const t = setTimeout(() => map.invalidateSize(), 0);

    return () => {
      clearTimeout(t);
      resizeObserver.disconnect();
      ['mousedown', 'touchstart', 'wheel'].forEach((ev) =>
        container.removeEventListener(ev, markMoved)
      );
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- criar só uma vez
  }, []);

  /* ── reconciliação dos marcadores ── */
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const valid = places.filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );

    for (const place of valid) {
      const marker = L.marker([place.lat, place.lng], {
        icon: markerIcon({
          selected: place.id === selectedId,
          kind: place.facilityType === 'hospital' ? 'hospital' : 'clinic',
        }),
        title: place.name || '',
        alt: place.name || 'Unidade de saúde',
        keyboard: true,
      });

      marker.bindPopup(popupHtml(place));
      if (onSelect) marker.on('click', () => onSelect(place));
      layer.addLayer(marker);
    }

    // Enquadrar apenas quando o CONJUNTO muda.
    const fitKey = valid.map((p) => p.id ?? `${p.lat},${p.lng}`).join('|');
    if (fitKey && fitKey !== lastFitKeyRef.current) {
      lastFitKeyRef.current = fitKey;
      const points = valid.map((p) => [p.lat, p.lng]);
      if (userPosition) points.push([userPosition.lat, userPosition.lng]);

      fitPointsRef.current = points;
      userMovedRef.current = false; // conjunto novo: voltamos a enquadrar
      map.invalidateSize();
      applyFit(map, points);
    }
  }, [places, selectedId, onSelect, userPosition]);

  /* ── marcador do utilizador ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userPosition) {
      userMarkerRef.current = L.marker(
        [userPosition.lat, userPosition.lng],
        { icon: markerIcon({ kind: 'user' }), zIndexOffset: 1000 }
      )
        .bindPopup('<strong>A sua localização</strong>')
        .addTo(map);
    }
  }, [userPosition]);

  /* ── linha de rota (indicativa) ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (userPosition && routeTo) {
      routeLayerRef.current = L.polyline(
        [
          [userPosition.lat, userPosition.lng],
          [routeTo.lat, routeTo.lng],
        ],
        { color: '#1565c0', weight: 3, dashArray: '6 6', opacity: 0.75 }
      ).addTo(map);
    }
  }, [userPosition, routeTo]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: 8, zIndex: 0 }}
      role="application"
      aria-label="Mapa de unidades de saúde"
    />
  );
}

export default memo(LeafletMap);
