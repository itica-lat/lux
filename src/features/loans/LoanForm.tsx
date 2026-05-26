import { useState, type FormEvent } from 'react';
import { gql } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CREATE_LOAN_MUTATION = `
 mutation CreateLoan($input: LoanInput!) {
 createLoan(input: $input) { id }
 }
`;

interface LoanFormProps {
 onSuccess: () => void;
}

export function LoanForm({ onSuccess }: LoanFormProps) {
 const [equipmentId, setEquipmentId] = useState('');
 const [userId, setUserId] = useState('');
 const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 16));
 const [returnDate, setReturnDate] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: FormEvent) => {
 e.preventDefault();
 if (!equipmentId || !userId || !returnDate) {
 setError('Completá todos los campos requeridos.');
 return;
 }
 setSaving(true);
 setError('');
 try {
 await gql(CREATE_LOAN_MUTATION, {
 input: { equipmentId, userId, issueDate, returnDate },
 });
 onSuccess();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Error al registrar');
 } finally {
 setSaving(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4 pt-2">
 <div className="space-y-1.5">
 <Label htmlFor="loan-equipment">ID del equipo</Label>
 <Input
 id="loan-equipment" placeholder="prod-1, prod-4, ..." value={equipmentId}
 onChange={e => setEquipmentId(e.target.value)}
 required
 />
 <p className="text-xs text-muted-foreground">Ingresá el ID del equipo disponible</p>
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="loan-user">ID del usuario</Label>
 <Input
 id="loan-user" placeholder="u-sol-1, u-sol-2, ..." value={userId}
 onChange={e => setUserId(e.target.value)}
 required
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <Label htmlFor="loan-issue">Fecha de entrega</Label>
 <Input
 id="loan-issue" type="datetime-local" value={issueDate}
 onChange={e => setIssueDate(e.target.value)}
 required
 />
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="loan-return">Fecha de devolución</Label>
 <Input
 id="loan-return" type="datetime-local" value={returnDate}
 onChange={e => setReturnDate(e.target.value)}
 required
 />
 </div>
 </div>

 {error && (
 <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
 {error}
 </div>
 )}

 <div className="flex gap-2 justify-end">
 <Button type="submit" disabled={saving}>
 {saving ? 'Registrando...' : 'Registrar préstamo'}
 </Button>
 </div>
 </form>
 );
}
