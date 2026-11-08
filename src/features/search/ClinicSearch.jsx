/**
 * Pesquisa de unidades de saúde.
 *
 * Substitui o componente `Test.jsx` da v1 (576 linhas, chamado "Test", que era
 * a aplicação toda). Além da mudança de Google para OpenStreetMap, corrige
 * bugs concretos que existiam:
 *
 *  - `createClinicObj` referenciava `data` antes de `data` existir, o que
 *    lançava ReferenceError sempre que se pesquisava uma clínica por nome.
 *  - As distâncias eram indexadas por `placesDistancesToUserPosition[index]`,
 *    onde o índice era relativo à PÁGINA mas o array era um Set deduplicado de
 *    distâncias. Os cartões mostravam a distância de outra clínica.
 *  - A deduplicação era feita por NOME, com `new Set(...).map(find)`: O(n²) e
 *    apagava clínicas distintas com o mesmo nome (ex.: duas unidades da mesma
 *    rede). Agora é por identificador OSM.
 *  - Por cada cartão eram feitas 3 chamadas (detalhes + carro + a pé). Com 20
 *    resultados, 60 chamadas faturadas por pesquisa. Agora o servidor devolve
 *    tudo com uma chamada de matriz.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, Grid, Link,
  Pagination, Paper, Stack, TextField, Typography, ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { getSpecialities, searchHealthcare, searchNearby } from '../../lib/api';
import { getPosition, PERMISSION_DENIED } from '../../lib/geolocation';
import LeafletMap from '../../components/Map/LeafletMap';
import { useLanguage } from '../../lib/i18n';

const PER_PAGE = 6;

function PlaceCard({ place, isSelected, onSelect, t }) {
  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect(place)}
      sx={{
        p: 2,
        height: '100%',
        cursor: 'pointer',
        borderColor: isSelected ? 'primary.main' : undefined,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {place.name}
      </Typography>

      {place.address && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {place.address}
        </Typography>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1, rowGap: 0.5 }}>
        {place.facilityType && (
          <Chip size="small" variant="outlined" label={place.facilityType} />
        )}
        {place.isPublic && <Chip size="small" color="primary" label={t.common.publicNetwork} />}
        {place.emergency === 'yes' && (
          <Chip size="small" color="error" variant="outlined" label={t.common.emergencyDept} />
        )}
        {place.wheelchair === 'yes' && (
          <Chip size="small" variant="outlined" label={t.common.accessible} />
        )}
      </Stack>

      {place.travel && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          🚗 {place.travel.durationText || '—'}
          {place.travel.distanceText ? ` · ${place.travel.distanceText}` : ''}
          {place.travel.estimated ? ` (${t.common.estimated})` : ''}
        </Typography>
      )}

      {place.openingHours && (
        <Typography variant="caption" color="text.secondary" display="block">
          {place.openingHours}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
        {place.phone && (
          <Link href={`tel:${place.phone}`} variant="body2" onClick={(e) => e.stopPropagation()}>
            {place.phone}
          </Link>
        )}
        {place.website && (
          <Link
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            onClick={(e) => e.stopPropagation()}
          >
            {t.search.website}
          </Link>
        )}
        {place.osmUrl && (
          <Link
            href={place.osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            onClick={(e) => e.stopPropagation()}
          >
            {t.search.fixOsm}
          </Link>
        )}
      </Stack>
    </Paper>
  );
}

export default function ClinicSearch() {
  const { language, t } = useLanguage();
  const [specialities, setSpecialities] = useState([]);
  const [speciality, setSpeciality] = useState('');
  const [city, setCity] = useState('');
  const [mode, setMode] = useState('city'); // city | nearby

  const [places, setPlaces] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [selected, setSelected] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getSpecialities(ctrl.signal)
      .then((d) => setSpecialities(d.specialities || []))
      .catch(() => {
        /* a autocompletar é um extra: falhar aqui não impede a pesquisa */
      });
    return () => ctrl.abort();
  }, []);

  const pageCount = Math.ceil(places.length / PER_PAGE);
  const visible = useMemo(
    () => places.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [places, page]
  );

  async function runCitySearch() {
    if (!city.trim()) {
      setError(t.search.needCity);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchHealthcare({
        speciality: speciality || undefined,
        city,
        language,
      });
      setPlaces(data.places);
      setMeta(data);
      setSelected(null);
      setPage(1);
      if (data.count === 0) {
        setError(t.search.noneInCity(city, speciality));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runNearbySearch() {
    if (!navigator.geolocation) {
      setError(t.search.noGeo);
      return;
    }
    setLoading(true);
    setError(null);

    let point;
    try {
      const pos = await getPosition();
      point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      setLoading(false);
      setError(err.code === PERMISSION_DENIED ? t.search.geoDenied : t.search.geoFailed);
      setMode('city');
      return;
    }

    setUserPosition(point);
    try {
      const data = await searchNearby({
        ...point,
        radius: 15_000,
        speciality: speciality || undefined,
        language,
      });
      setPlaces(data.places);
      setMeta(data);
      setSelected(null);
      setPage(1);
      if (data.count === 0) {
        setError(t.search.noneNearby);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (mode === 'nearby') runNearbySearch();
    else runCitySearch();
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t.search.title}
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(e, v) => v && setMode(v)}
            >
              <ToggleButton value="city">{t.search.byCity}</ToggleButton>
              <ToggleButton value="nearby">{t.search.nearMe}</ToggleButton>
            </ToggleButtonGroup>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Autocomplete
                freeSolo
                fullWidth
                options={specialities}
                value={speciality}
                onInputChange={(e, v) => setSpeciality(v || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t.search.speciality}
                    placeholder={t.search.specialityHint}
                  />
                )}
              />

              {mode === 'city' && (
                <TextField
                  fullWidth
                  label={t.search.city}
                  placeholder={t.search.cityHint}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              )}
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              {loading ? t.common.searching : t.search.submit}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {places.length > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <LeafletMap
              places={places}
              userPosition={userPosition}
              selectedId={selected?.id || null}
              onSelect={setSelected}
              height={380}
            />
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Typography variant="h6" component="h2">
              {t.search.unitsFound(places.length)}
              {meta?.matchedBy === 'name' && ` ${t.search.byName}`}
            </Typography>
            {pageCount > 1 && (
              <Pagination
                count={pageCount}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                size="small"
              />
            )}
          </Stack>

          <Grid container spacing={2}>
            {visible.map((place) => (
              <Grid item xs={12} sm={6} md={4} key={place.id}>
                <PlaceCard
                  place={place}
                  isSelected={selected?.id === place.id}
                  onSelect={setSelected}
                  t={t}
                />
              </Grid>
            ))}
          </Grid>

          {meta?.dataQualityNote && (
            <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {meta.dataQualityNote}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {meta.attribution}
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
