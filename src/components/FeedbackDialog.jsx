/**
 * Formulário de feedback.
 *
 * Consolida os três componentes da v1 (FeedbackModal + FeedbackForm +
 * FeedbackFormField) e corrige o que estava mal:
 *
 *  - O URL do servidor estava escrito no código, apontando para um
 *    deployment diferente do resto da aplicação. Agora usa a mesma base
 *    (VITE_API_URL) que todas as outras chamadas.
 *  - O campo de comentário era `<input type="textarea">`, que não existe em
 *    HTML: o browser tratava-o como `type="text"`, uma linha só. É agora um
 *    `<textarea>` a sério.
 *  - Usava axios e sweetalert2 só para isto. Passou a fetch nativo e MUI.
 *  - Recolhíamos nome, e-mail e país sem dizer para quê. Minimizámos os
 *    campos e o e-mail passou a opcional, com indicação explícita do fim.
 */

import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';

import { useT } from '../lib/i18n';

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(
  /\/+$/,
  ''
);

export default function FeedbackDialog() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  function close() {
    setOpen(false);
    // Deixa a animação de fecho terminar antes de limpar.
    setTimeout(() => {
      setState('idle');
      setError(null);
      setMessage('');
      setEmail('');
    }, 200);
  }

  async function submit(event) {
    event.preventDefault();
    if (!message.trim()) {
      setError(t.feedback.needMessage);
      return;
    }

    setState('sending');
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          page: window.location.pathname,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || `Erro ${res.status}.`);
      }
      setState('sent');
      setTimeout(close, 2000);
    } catch (err) {
      setState('error');
      setError(err.message || t.feedback.failed);
    }
  }

  return (
    <>
      <Tooltip title={t.feedback.open}>
        <IconButton
          onClick={() => setOpen(true)}
          aria-label={t.feedback.open}
          size="small"
        >
          <FeedbackOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <form onSubmit={submit}>
          <DialogTitle>{t.feedback.title}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t.feedback.intro}
            </DialogContentText>

            {state === 'sent' ? (
              <Alert severity="success">{t.feedback.thanks}</Alert>
            ) : (
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  minRows={4}
                  required
                  label={t.feedback.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  disabled={state === 'sending'}
                />
                <TextField
                  fullWidth
                  type="email"
                  label={t.feedback.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={state === 'sending'}
                  helperText={t.feedback.emailHint}
                />
                <Typography variant="caption" color="text.secondary">
                  {t.feedback.privacy}
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            )}
          </DialogContent>

          {state !== 'sent' && (
            <DialogActions>
              <Button onClick={close} disabled={state === 'sending'}>
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={state === 'sending' || !message.trim()}
              >
                {state === 'sending' ? t.common.sending : t.common.send}
              </Button>
            </DialogActions>
          )}
        </form>
      </Dialog>
    </>
  );
}
