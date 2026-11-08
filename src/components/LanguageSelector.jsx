/**
 * Seletor de idioma.
 *
 * Fica no topo e está sempre visível, não escondido num menu de definições.
 * Quem precisa dele é precisamente quem não consegue ler o resto da página
 * para o encontrar: cada idioma aparece escrito NO PRÓPRIO IDIOMA (Русский, não
 * "Russo"), porque é assim que alguém que não lê português o reconhece.
 */

import { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemText, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

import { LANGUAGES, useLanguage } from '../lib/i18n';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, t } = useLanguage();
  const [anchor, setAnchor] = useState(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  function choose(code) {
    setLanguage(code);
    setAnchor(null);
  }

  return (
    <Box>
      <Tooltip title={t.language.change}>
        <Button
          onClick={(e) => setAnchor(e.currentTarget)}
          startIcon={<LanguageIcon />}
          size="small"
          color="inherit"
          aria-haspopup="menu"
          aria-expanded={anchor ? 'true' : undefined}
          aria-label={t.language.change}
          sx={{ fontWeight: 600, minWidth: 0 }}
        >
          {compact ? current.short : current.name}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {LANGUAGES.map((l) => (
          <MenuItem
            key={l.code}
            selected={l.code === language}
            onClick={() => choose(l.code)}
            // lang correto para que o leitor de ecrã pronuncie cada nome na
            // sua própria língua.
            lang={l.code}
          >
            <Box
              sx={{
                width: 24,
                display: 'flex',
                alignItems: 'center',
                flex: 'none',
              }}
            >
              {l.code === language && <CheckIcon fontSize="small" color="primary" />}
            </Box>
            <ListItemText
              primary={l.name}
              primaryTypographyProps={{
                fontWeight: l.code === language ? 700 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
