import { useState, type FormEvent } from 'react';
import { gql } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import type { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: UserInput!) { createUser(input: $input) { id } }
`;
const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $input: UserInput!) { updateUser(id: $id, input: $input) { id } }
`;

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? '');
  const [dni, setDni] = useState(user?.dni ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'solicitante');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && user) {
        await gql(UPDATE_USER_MUTATION, {
          id: user.id,
          input: { name, dni, email, role, ...(password ? { password } : {}) },
        });
      } else {
        if (!password) { setError('La contraseña es requerida.'); setSaving(false); return; }
        await gql(CREATE_USER_MUTATION, {
          input: { name, dni, email, role, password },
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="uf-name">Nombre completo</Label>
        <Input id="uf-name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="uf-dni">Cédula</Label>
          <Input id="uf-dni" value={dni} onChange={e => setDni(e.target.value)} maxLength={8} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="uf-role">Rol</Label>
          <Select value={role} onValueChange={v => setRole(v as UserRole)}>
            <SelectTrigger id="uf-role"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABELS) as UserRole[]).filter(r => r !== 'root_admin').map(r => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="uf-email">Email</Label>
        <Input id="uf-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="uf-password">Contraseña {isEdit && '(dejar vacío para no cambiar)'}</Label>
        <Input id="uf-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEdit} />
      </div>
      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-3 text-sm text-[rgb(255,69,58)]">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
        </Button>
      </div>
    </form>
  );
}
