import { createTheme } from '@mui/material/styles'

/**
 * Tema do Material UI alinhado à paleta do projeto.
 *
 * Os hexes estão duplicados do `@theme` em src/index.css de propósito: o MUI
 * deriva tons (hover, contraste, sombra) a partir do valor, e não consegue
 * fazer isso com `var(--color-saito-blue)`. Mudou a cor lá, mude aqui também.
 */
const COLORS = {
  saitoBlue: '#1d4ed8',
  deepBlue: '#0f2a54',
  lightBlue: '#eaf1fd',
  black: '#14171a',
  muted: '#5a6472',
  subtle: '#8a93a0',
  line: '#e4e8ee',
  lineStrong: '#cbd1d8',
  canvas: '#f5f7fa',
}

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.saitoBlue,
      dark: COLORS.deepBlue,
      light: COLORS.lightBlue,
      contrastText: '#ffffff',
    },
    error: {
      main: '#c62828', // danger
      light: '#fdecec', // danger-light
      contrastText: '#ffffff',
    },
    text: {
      primary: COLORS.black,
      secondary: COLORS.muted,
    },
    divider: COLORS.line,
    background: { default: COLORS.canvas, paper: '#ffffff' },
  },
  // Herda a font-sans definida no body pelo Tailwind em vez da Roboto do MUI.
  typography: { fontFamily: 'inherit', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, minHeight: 40 },
        sizeLarge: { minHeight: 44, paddingInline: 20, fontSize: 14 },
      },
      variants: [
        {
          // Botão secundário (Cancelar, Limpar): neutro, sem competir com o azul.
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: COLORS.line,
            color: COLORS.black,
            backgroundColor: '#ffffff',
            '&:hover': { borderColor: COLORS.lineStrong, backgroundColor: COLORS.canvas },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color .15s, color .15s',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dfe4ea' },
          '&:hover:not(.Mui-disabled, .Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.lineStrong,
          },
          // Foco: borda azul fina e um halo claro, no lugar da borda grossa do MUI.
          '&.Mui-focused:not(.Mui-error)': { boxShadow: `0 0 0 4px ${COLORS.lightBlue}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
        },
        input: { '&::placeholder': { color: COLORS.subtle, opacity: 1 } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 24px 48px rgba(15, 42, 84, 0.18)' },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        // Só o fundo das modais; o `invisible` (menus, popovers) segue transparente.
        root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(15, 42, 84, 0.32)' } },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: COLORS.black, fontSize: 12, borderRadius: 6 },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
})
