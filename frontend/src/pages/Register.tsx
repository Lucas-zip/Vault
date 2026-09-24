import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button, Input, PasswordInput, FormError } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatCpfCnpj, formatPhone } from '../utils/format';

export function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpfCnpj: '',
    phone: '',
  });
  const [error, setError] = useState('');

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function getApiError(error: unknown): string {
    const message = (
      error as { response?: { data?: { message?: string } } }
    ).response?.data?.message;
    return message || 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        cpfCnpj: form.cpfCnpj.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-medium tracking-[-0.02em] text-foreground">
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-muted-fg">
          Comece a gerenciar suas finanças em minutos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="João da Silva"
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="voce@exemplo.com"
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CPF / CNPJ"
              value={form.cpfCnpj}
              onChange={(e) =>
                updateField('cpfCnpj', formatCpfCnpj(e.target.value))
              }
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoComplete="off"
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) =>
                updateField('phone', formatPhone(e.target.value))
              }
              placeholder="(11) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <PasswordInput
            label="Senha"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
          />
          <PasswordInput
            label="Confirmar senha"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
          />

          {error && <FormError>{error}</FormError>}

          <Button type="submit" fullWidth loading={isLoading}>
            Criar conta
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-fg">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-accent hover:text-foreground font-medium hover:underline focus-ring rounded-sm"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
