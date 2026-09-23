import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],

  server: {
    /**
     * O backend (Spring) não publica cabeçalhos de CORS, então o navegador
     * bloquearia uma chamada direta de localhost:5173 para localhost:8080.
     * Em desenvolvimento o Vite faz a ponte: tudo que sai para /api é
     * repassado pelo servidor de dev, que não passa pela checagem de CORS.
     *
     * Por isso VITE_API_URL fica vazia em dev — o api.ts cai no /api sozinho.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
