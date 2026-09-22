import { createTheme } from '@mui/material/styles'

/**
 * Tema do Material UI alinhado à paleta do projeto.
 *
 * Os hexes estão duplicados do `@theme` em src/index.css de propósito: o MUI
 * deriva tons (hover, contraste, sombra) a partir do valor, e não consegue
 * fazer isso com `var(--color-saito-blue)`. Mudou a cor lá, mude aqui também.
 */
export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8', // saito-blue
      dark: '#0f2a54', // deep-blue
      light: '#eaf1fd', // light-blue
      contrastText: '#ffffff',
    },
    text: {
      primary: '#14171a', // black
      secondary: '#5a6472',
    },
    divider: '#cbd1d8', // gray
    background: { default: '#ffffff', paper: '#ffffff' },
  },
  // Herda a font-sans definida no body pelo Tailwind em vez da Roboto do MUI.
  typography: { fontFamily: 'inherit' },
  shape: { borderRadius: 8 },
})
