import { useState, type FormEvent } from "react";
import { gql } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RETURN_MUTATION = `
 mutation ReturnLoan($id: ID!) { returnLoan(id: $id) { id status actualReturnDate } }
`;

interface ReturnFormProps {
  loanId: string;
  onSuccess: () => void;
}

export function ReturnForm({ loanId, onSuccess }: ReturnFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await gql(RETURN_MUTATION, { id: loanId });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar devolución");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Se registrará la devolución con la fecha y hora actual.
      </p>
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Registrando..." : "Confirmar devolución"}
        </Button>
      </div>
    </form>
  );
}
