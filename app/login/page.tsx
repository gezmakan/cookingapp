import LoginForm from '@/components/LoginForm'

type LoginPageProps = {
  searchParams: {
    mode?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const modeParam = searchParams?.mode === 'signup' ? 'signup' : 'login'
  return <LoginForm initialMode={modeParam} />
}
