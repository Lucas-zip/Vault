import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button, Input, PasswordInput, FormError } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch {
      setError('E-mail ou senha incorretos. Tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-medium tracking-[-0.02em] text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm text-muted-fg">
          Entre na sua conta para gerenciar suas finanças.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            icon={<Mail className="w-4 h-4" />}
          />
          <PasswordInput
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            required
            icon={<Lock className="w-4 h-4" />}
          />

          {error && <FormError>{error}</FormError>}

          <Button type="submit" fullWidth loading={isLoading}>
            Entrar
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-fg">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-accent hover:text-foreground font-medium hover:underline focus-ring rounded-sm"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
