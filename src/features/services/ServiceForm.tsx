import { useState, type FormEvent } from 'react';
import { gql } from '@/lib/utils';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceType } from '@/lib/types';

const CREATE_SERVICE_MUTATION = `
  mutation CreateServiceRequest($input: ServiceRequestInput!) {
    createServiceRequest(input: $input) { id }
  }
`;

interface ServiceFormProps {
  onSuccess: () => void;
}

export function ServiceForm({ onSuccess }: ServiceFormProps) {
  const [type, setType] = useState<ServiceType>('lab_preparation');
  const [description, setDescription] = useState('');
  const [labNumber, setLabNumber] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('La descripción es requerida.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await gql(CREATE_SERVICE_MUTATION, {
        input: {
          type,
          description,
          labNumber: type === 'lab_preparation' ? labNumber || undefined : undefined,
          softwareName: type === 'software_installation' ? softwareName || undefined : undefined,
          equipmentId: type === 'equipment_setup' ? equipmentId || undefined : undefined,
        },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear solicitud');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Tipo de solicitud</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-xl border py-2.5 px-3 text-sm text-left transition-all cursor-pointer ${
                type === t
                  ? 'border-[rgba(0,122,255,0.3)] bg-[rgba(0,122,255,0.08)] text-[rgb(0,122,255)]'
                  : 'border-black/10 bg-white/40 text-[#86868b] dark:border-white/10 dark:bg-black/20 hover:bg-black/5'
              }`}
            >
              {SERVICE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {type === 'lab_preparation' && (
        <div className="space-y-1.5">
          <Label htmlFor="lab-number">Número de laboratorio</Label>
          <Input id="lab-number" value={labNumber} onChange={e => setLabNumber(e.target.value)} placeholder="Ej: 3" />
        </div>
      )}

      {type === 'software_installation' && (
        <div className="space-y-1.5">
          <Label htmlFor="software">Nombre del software</Label>
          <Input id="software" value={softwareName} onChange={e => setSoftwareName(e.target.value)} placeholder="Ej: AutoCAD 2024" />
        </div>
      )}

      {type === 'equipment_setup' && (
        <div className="space-y-1.5">
          <Label htmlFor="eq-id">ID del equipo</Label>
          <Input id="eq-id" value={equipmentId} onChange={e => setEquipmentId(e.target.value)} placeholder="Ej: prod-3" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describí lo que necesitás en detalle..."
          className="h-32"
          required
        />
      </div>

      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-3 text-sm text-[rgb(255,69,58)]">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </div>
    </form>
  );
}
