import { useState, type FormEvent } from 'react';
import { gql } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const RETURN_MUTATION = `
  mutation ReturnLoan($id: ID!) { returnLoan(id: $id) { id status actualReturnDate } }
`;

interface ReturnFormProps {
  loanId: string;
  onSuccess: () => void;
}

export function ReturnForm({ loanId, onSuccess }: ReturnFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await gql(RETURN_MUTATION, { id: loanId });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar devolución');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#86868b]">
        Se registrará la devolución con la fecha y hora actual.
      </p>
      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-3 text-sm text-[rgb(255,69,58)]">
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Registrando...' : 'Confirmar devolución'}
        </Button>
      </div>
    </form>
  );
}
