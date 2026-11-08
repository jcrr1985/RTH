/**
 * "Os Meus Direitos" — assistente de direitos do utente do SNS.
 *
 * Esta é a funcionalidade que distingue o RTH de uma pesquisa no Google Maps.
 * O Google diz-te onde é a clínica mais próxima. Isto diz-te que, estando à
 * espera há 210 dias de uma cirurgia com TMRG de 180, já tens direito a um
 * vale cirurgia, a um segundo vale, a pedir tratamento noutro Estado-Membro
 * ao abrigo da Diretiva 2011/24/UE, e a reclamar à ERS — com a base legal e
 * os passos de cada um.
 *
 * Contexto que justifica a funcionalidade: no final de 2025 havia mais de um
 * milhão de utentes em espera por consulta de especialidade e cerca de 264 mil
 * por cirurgia, e o diretor executivo do SNS reconheceu publicamente que as
 * listas não vão desaparecer.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Alert, AlertTitle, Box, Button, Chip, CircularProgress, Collapse,
  Divider, FormControl, InputLabel, Link, MenuItem, Paper, Select,
  Stack, TextField, Typography, LinearProgress,
} from '@mui/material';

import { assessRights, getRightsOptions } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';

const SEVERITY_COLOR = {
  alta: 'error',
  media: 'warning',
  informativa: 'info',
};

/** Só a cor: o título vem traduzido do servidor em `statusLabel`. */
const STATUS_SEVERITY = {
  dentro_do_prazo: 'info',
  transferencia_devida: 'warning',
  prazo_ultrapassado: 'error',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Barra de progresso do TMRG, com o limiar de transferência marcado. */
function TmrgProgress({ waiting, tmrg, unitLabel, t }) {
  // A barra satura nos 100%, mas o RÓTULO mostra a percentagem real: saber que
  // se está nos 167% e não "nos 100%" é precisamente o que leva alguém a agir.
  const pct = Math.round(waiting.percentElapsed * 100);
  const barPct = Math.min(100, pct);
  const thresholdPct = Math.round(waiting.transferThreshold * 100);
  const color = pct >= 100 ? 'error' : pct >= thresholdPct ? 'warning' : 'success';

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2">
          {t.rights.ofDays(waiting.daysWaited, Math.round(tmrg.days), unitLabel)}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {pct}%
        </Typography>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={barPct}
          color={color}
          sx={{ height: 10, borderRadius: 5 }}
        />
        {/* Marca do limiar de emissão do vale (75% normal / 50% prioritária) */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: `${thresholdPct}%`,
            top: -3,
            height: 16,
            width: 2,
            bgcolor: 'text.primary',
            opacity: 0.6,
          }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t.rights.thresholdNote(thresholdPct, tmrg.dueDate)}
      </Typography>
    </Box>
  );
}

function EntitlementCard({ entitlement, t }) {
  const [open, setOpen] = useState(entitlement.severity === 'alta');

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700}>
              {entitlement.title}
            </Typography>
            <Chip
              size="small"
              label={t.severity[entitlement.severity] || entitlement.severity}
              color={SEVERITY_COLOR[entitlement.severity] || 'default'}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {entitlement.summary}
          </Typography>
        </Box>
        <Button size="small" onClick={() => setOpen((v) => !v)}>
          {open ? t.common.less : t.common.howTo}
        </Button>
      </Stack>

      <Collapse in={open}>
        <Divider sx={{ my: 1.5 }} />

        {entitlement.whatItMeans && (
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {entitlement.whatItMeans}
          </Typography>
        )}

        {entitlement.steps?.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {t.common.steps}
            </Typography>
            <Box component="ol" sx={{ pl: 3, m: 0, mb: 1.5 }}>
              {entitlement.steps.map((s) => (
                <Typography component="li" variant="body2" key={s} sx={{ mb: 0.5 }}>
                  {s}
                </Typography>
              ))}
            </Box>
          </>
        )}

        {entitlement.warnings?.length > 0 && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {entitlement.warnings.map((w) => (
                <Typography component="li" variant="body2" key={w}>
                  {w}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        {entitlement.legalBasis?.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block">
            {t.common.legalBasis}: {entitlement.legalBasis.join(' · ')}
          </Typography>
        )}

        {entitlement.links?.length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
            {entitlement.links.map((l) => (
              <Link
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {l.label}
              </Link>
            ))}
          </Stack>
        )}
      </Collapse>
    </Paper>
  );
}

export default function RightsWizard() {
  const { language, t } = useLanguage();
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState(null);

  const [careType, setCareType] = useState('cirurgia');
  const [condition, setCondition] = useState('geral');
  const [priority, setPriority] = useState('normal');
  const [requestDate, setRequestDate] = useState('');
  const [valesReceived, setValesReceived] = useState(0);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // As opções trazem rótulos traduzidos, por isso recarregam ao mudar de idioma.
  useEffect(() => {
    const ctrl = new AbortController();
    getRightsOptions(language, ctrl.signal)
      .then(setOptions)
      .catch((err) => {
        if (err.name !== 'AbortError') setOptionsError(err.message);
      });
    return () => ctrl.abort();
  }, [language]);

  // Um resultado já mostrado fica desatualizado se o idioma mudar.
  useEffect(() => {
    setResult(null);
  }, [language]);

  /* Opções em cascata: a lei não prevê todas as combinações (por exemplo, não
   * existe prioridade "normal" para primeira consulta oncológica), por isso os
   * selects derivam sempre da tabela devolvida pelo servidor. */
  const careOption = useMemo(
    () => options?.options?.find((o) => o.careType === careType) || null,
    [options, careType]
  );
  const conditionOption = useMemo(
    () => careOption?.conditions?.find((c) => c.condition === condition) || null,
    [careOption, condition]
  );

  useEffect(() => {
    if (!careOption) return;
    if (!careOption.conditions.some((c) => c.condition === condition)) {
      setCondition(careOption.conditions[0].condition);
    }
  }, [careOption, condition]);

  useEffect(() => {
    if (!conditionOption) return;
    if (!conditionOption.priorities.some((p) => p.priority === priority)) {
      setPriority(conditionOption.priorities[0].priority);
    }
  }, [conditionOption, priority]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!requestDate) {
      setError(t.rights.needDate);
      return;
    }

    setLoading(true);
    try {
      const data = await assessRights({
        careType,
        condition,
        priority,
        requestDate,
        valesReceived,
        language,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const severity = result ? STATUS_SEVERITY[result.status] : null;

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t.rights.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t.rights.lede}
      </Typography>

      {optionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t.rights.loadFailed}: {optionsError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <FormControl fullWidth disabled={!options}>
              <InputLabel id="care-type-label">{t.rights.careType}</InputLabel>
              <Select
                labelId="care-type-label"
                label={t.rights.careType}
                value={careType}
                onChange={(e) => setCareType(e.target.value)}
              >
                {(options?.options || []).map((o) => (
                  <MenuItem key={o.careType} value={o.careType}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!careOption}>
              <InputLabel id="condition-label">{t.rights.condition}</InputLabel>
              <Select
                labelId="condition-label"
                label={t.rights.condition}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {(careOption?.conditions || []).map((c) => (
                  <MenuItem key={c.condition} value={c.condition}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!conditionOption}>
              <InputLabel id="priority-label">{t.rights.priority}</InputLabel>
              <Select
                labelId="priority-label"
                label={t.rights.priority}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {(conditionOption?.priorities || []).map((p) => (
                  <MenuItem key={p.priority} value={p.priority}>
                    {p.label} — {p.value} {p.unitLabel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label={t.rights.requestDate}
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayIso() }}
              helperText={t.rights.requestDateHint}
            />

            {careType === 'cirurgia' && (
              <TextField
                fullWidth
                select
                label={t.rights.vales}
                value={valesReceived}
                onChange={(e) => setValesReceived(Number(e.target.value))}
              >
                <MenuItem value={0}>{t.rights.valeNone}</MenuItem>
                <MenuItem value={1}>{t.rights.valeOne}</MenuItem>
                <MenuItem value={2}>{t.rights.valeTwo}</MenuItem>
              </TextField>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !options}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              {loading ? t.common.calculating : t.rights.submit}
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
          <Alert severity={severity} sx={{ mb: 2 }}>
            <AlertTitle>{result.statusLabel}</AlertTitle>
            <Typography variant="body2">
              {result.labels.careType} · {result.labels.condition} ·{' '}
              {result.labels.priority}. {t.rights.maxTime}: {result.tmrg.value}{' '}
              {result.labels.unit}.
            </Typography>
            <TmrgProgress
              waiting={result.waiting}
              tmrg={result.tmrg}
              unitLabel={result.labels.unit}
              t={t}
            />
          </Alert>

          <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1.5 }}>
            {t.rights.whatYouCanDo(result.entitlements.length)}
          </Typography>

          {result.entitlements.map((e) => (
            <EntitlementCard key={e.id} entitlement={e} t={t} />
          ))}

          <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {result.disclaimer}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              {result.legal.legalBasis.join('; ')}.{' '}
              {t.rights.verifiedOn(result.legal.verifiedOn, '')}
              <Link
                href={result.legal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.rights.ersTable}
              </Link>
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
