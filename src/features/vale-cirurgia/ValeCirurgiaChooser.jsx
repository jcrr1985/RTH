/**
 * Seletor de hospital para Vale Cirurgia / Nota de Transferência.
 *
 * O MOMENTO EXATO QUE ISTO RESOLVE
 * Chega uma carta (ou um e-mail) com um número de vale e uma lista de nomes de
 * hospitais. E um formulário de "Justificação de Recusa". O utente não tem
 * como saber qual lhe fica perto, se chega lá sem carro, nem quantas vezes
 * terá de repetir a viagem. Muitos recusam — e ficam na mesma fila.
 *
 * Num período de oito meses foram emitidos mais de 134 400 vales cirurgia e
 * 55,37% foram recusados pelos utentes. Noutro semestre, de 51 940 vales
 * emitidos só 26,9% chegaram a ser utilizados.
 *
 * O RTH já sabia calcular distâncias e tempos de viagem. Esta página aponta
 * essa capacidade ao momento em que ela decide algo.
 */

import { useState } from 'react';
import {
  Alert, AlertTitle, Box, Button, Chip, CircularProgress, Divider, Link,
  Paper, Stack, TextField, Typography,
} from '@mui/material';

import MyLocationIcon from '@mui/icons-material/MyLocation';
import { rankValeOptions, reverseGeocode } from '../../lib/api';
import { getPosition, PERMISSION_DENIED } from '../../lib/geolocation';
import LeafletMap from '../../components/Map/LeafletMap';
import { useLanguage } from '../../lib/i18n';

/** Extrai nomes de hospitais de texto colado do documento do vale. */
function parseHospitalNames(raw) {
  return raw
    .split(/[\n;]+/)
    .map((line) =>
      line
        // numeração e marcas de lista no início da linha
        .replace(/^\s*(\d+\s*[.)\-–]\s*|[-•*]\s*)/, '')
        .trim()
    )
    .filter((line) => line.length >= 3)
    .slice(0, 20);
}

function HospitalCard({ option, isSelected, onSelect, t }) {
  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect(option)}
      sx={{
        p: 2,
        mb: 1.5,
        cursor: 'pointer',
        borderColor: isSelected ? 'primary.main' : undefined,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Chip
          label={`#${option.rank}`}
          color={option.rank === 1 ? 'primary' : 'default'}
          size="small"
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {option.name}
          </Typography>
          {option.address && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {option.address}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            sx={{ mt: 1, rowGap: 0.5 }}
          >
            {option.driving?.durationText && (
              <Typography variant="body2">
                🚗 {option.driving.durationText}
                {option.driving.distanceText
                  ? ` · ${option.driving.distanceText}`
                  : ''}
                {option.driving.estimated ? ` (${t.common.estimated})` : ''}
              </Typography>
            )}
            {option.totalTravelBurden && (
              <Typography variant="body2" fontWeight={600}>
                {t.vale.totalTravel}: {option.totalTravelBurden.totalText}
              </Typography>
            )}
          </Stack>

          {option.totalTravelBurden && (
            <Typography variant="caption" color="text.secondary" display="block">
              {option.totalTravelBurden.explanation}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
            {option.phone && (
              <Link href={`tel:${option.phone}`} variant="body2">
                {option.phone}
              </Link>
            )}
            {option.website && (
              <Link
                href={option.website}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                Site
              </Link>
            )}
            {option.isPublic != null && (
              <Chip
                size="small"
                variant="outlined"
                label={option.isPublic ? t.common.publicNetwork : t.common.privateSocial}
              />
            )}
          </Stack>
        </Box>

        <Box sx={{ textAlign: 'right', minWidth: 56 }}>
          <Typography variant="h6">{option.score}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t.vale.logistics}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ValeCirurgiaChooser() {
  const { language, t } = useLanguage();
  const [rawNames, setRawNames] = useState('');
  const [mode, setMode] = useState('geo'); // geo | address
  const [address, setAddress] = useState('');
  const [origin, setOrigin] = useState(null);
  const [originLabel, setOriginLabel] = useState('');

  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  const names = parseHospitalNames(rawNames);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError(t.search.noGeo);
      return;
    }
    setLocating(true);
    setError(null);
    setMode('geo');

    let point;
    try {
      const pos = await getPosition();
      point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      setLocating(false);
      setError(err.code === PERMISSION_DENIED ? t.search.geoDenied : t.search.geoFailed);
      setMode('address');
      return;
    }

    setOrigin(point);
    try {
      const place = await reverseGeocode(point.lat, point.lng);
      setOriginLabel(place?.city || place?.displayName || t.vale.locationOk);
    } catch {
      setOriginLabel(t.vale.locationOk);
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSelected(null);

    if (names.length === 0) {
      setError(t.vale.needHospitals);
      return;
    }

    let point = origin;

    if (mode === 'address') {
      if (!address.trim()) {
        setError(t.vale.needAddress);
        return;
      }
      setLoading(true);
      try {
        const { geocode } = await import('../../lib/api');
        const hit = await geocode(address);
        point = { lat: hit.lat, lng: hit.lng };
        setOrigin(point);
        setOriginLabel(hit.displayName || address);
      } catch (err) {
        setLoading(false);
        setError(t.vale.addressFailed(err.message));
        return;
      }
    }

    if (!point) {
      setError(t.vale.needOrigin);
      return;
    }

    setLoading(true);
    try {
      const data = await rankValeOptions({ hospitalNames: names, origin: point, language });
      setResult(data);
      setSelected(data.options[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const mapPlaces = (result?.options || []).map((o) => ({
    id: o.inputName,
    name: o.name,
    lat: o.lat,
    lng: o.lng,
    address: o.address,
    phone: o.phone,
    website: o.website,
    facilityType: o.facilityType,
    travel: o.driving,
  }));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t.vale.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t.vale.lede}
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={t.vale.hospitals}
              placeholder={
                'Hospital de Braga\n' +
                'Hospital Senhora da Oliveira, Guimarães\n' +
                'Hospital da Luz Arrábida'
              }
              value={rawNames}
              onChange={(e) => setRawNames(e.target.value)}
              helperText={
                names.length > 0 ? t.vale.recognised(names.length) : t.vale.pasteHint
              }
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t.vale.origin}
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Button
                    variant={mode === 'geo' && origin ? 'contained' : 'outlined'}
                    onClick={useMyLocation}
                    disabled={locating}
                    startIcon={locating ? <CircularProgress size={18} /> : <MyLocationIcon />}
                  >
                    {locating ? t.common.locating : t.vale.useLocation}
                  </Button>
                  {mode === 'geo' && origin && (
                    <Typography variant="body2" color="success.main">
                      {originLabel || t.vale.locationOk}
                    </Typography>
                  )}
                </Stack>
                <TextField
                  fullWidth
                  label={t.vale.address}
                  placeholder={t.vale.addressHint}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    // Escribir una dirección sustituye a la ubicación del navegador.
                    setMode('address');
                    setOrigin(null);
                    setOriginLabel('');
                  }}
                />
              </Stack>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              {loading ? t.common.calculating : t.vale.submit}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box>
          {result.note && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {result.note}
            </Alert>
          )}

          {result.unresolved?.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>
                {t.vale.unresolved(result.unresolved.length)}
              </AlertTitle>
              {result.unresolved.map((u) => u.inputName).join(', ')}. {t.vale.unresolvedHint}
            </Alert>
          )}

          {result.options.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <LeafletMap
                  places={mapPlaces}
                  userPosition={origin}
                  selectedId={selected?.inputName || null}
                  onSelect={(p) =>
                    setSelected(
                      result.options.find((o) => o.inputName === p.id) || null
                    )
                  }
                  routeTo={selected ? { lat: selected.lat, lng: selected.lng } : null}
                  height={360}
                />
              </Box>

              {result.summary?.nearest && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>{t.vale.nearest}: {result.summary.nearest.name}</AlertTitle>
                  {result.summary.nearest.durationText} {t.common.byCar}
                  {result.summary.nearest.distanceText
                    ? ` · ${result.summary.nearest.distanceText}`
                    : ''}
                  .
                </Alert>
              )}

              <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
                {t.vale.ranked}
              </Typography>

              {result.options.map((o) => (
                <HospitalCard
                  key={o.inputName}
                  option={o}
                  isSelected={selected?.inputName === o.inputName}
                  onSelect={setSelected}
                  t={t}
                />
              ))}

              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t.vale.beforeDeciding}
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {result.guidance.map((g) => (
                    <Typography component="li" variant="body2" key={g} sx={{ mb: 0.5 }}>
                      {g}
                    </Typography>
                  ))}
                </Box>
              </Paper>

              <Paper
                variant="outlined"
                sx={{ p: 2, mt: 2, bgcolor: 'action.hover' }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  {result.disclaimer}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block">
                  {t.vale.weights(
                    Math.round(result.weights.drivingTime * 100),
                    Math.round(result.weights.walkAccess * 100),
                    Math.round(result.weights.dataCompleteness * 100)
                  )}{' '}
                  {result.attribution}
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
