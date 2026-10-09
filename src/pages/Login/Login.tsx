import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSetAtom } from 'jotai'
import { useNavigate, useLocation } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { login } from '../../services/auth'
import { signInAtom } from '../../store'
import { ApiError } from '../../utils/api'
import Brand from '../../components/Brand/Brand'

/** Para onde mandar o usuário depois do login quando não veio de outra página. */
const DEFAULT_REDIRECT = '/'

/**
 * Tela de login. Card centralizado com e-mail, senha e o botão de entrar.
 *
 * O token vai para o `signInAtom`, que persiste a sessão e alimenta o header
 * Authorization do axios — esta página não fala com o localStorage direto.
 */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = useSetAtom(signInAtom)
  const navigate = useNavigate()
  const location = useLocation()

  /** Rota que o RequireAuth guardou ao barrar o acesso, se houver. */
  const from = (location.state as { from?: string } | null)?.from ?? DEFAULT_REDIRECT

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      signIn(data.token)
      // `replace` tira o /login do histórico: o botão voltar não retorna para cá.
      navigate(from, { replace: true })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.mutate({ email: email.trim(), senha: password })
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Não foi possível entrar. Tente novamente.'
        : null

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas px-4 py-12">
      <Brand withSubtitle />
      <main className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(20,23,26,0.04)] sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-content-muted">Acesse com seu e-mail e senha.</p>
        </div>

        {/* noValidate: quem valida e escreve as mensagens é o app, não o navegador. */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
            fullWidth
            disabled={mutation.isPending}
          />

          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            fullWidth
            disabled={mutation.isPending}
          />

          {errorMessage && (
            // role="alert" faz o leitor de tela anunciar a falha sem mover o foco.
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined
            }
            sx={{ mt: 1 }}
          >
            {mutation.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </main>
    </div>
  )
}

export default Login
