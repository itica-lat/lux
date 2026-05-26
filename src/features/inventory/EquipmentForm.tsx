import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gql } from '@/lib/utils';
import { ROUTES, EQUIPMENT_KINDS, LOCATIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) { id }
  }
`;

const CREATE_COMPONENT_MUTATION = `
  mutation CreateComponent($input: ComponentInput!) {
    createComponent(input: $input) { id }
  }
`;

interface EquipmentFormProps {
  mode: 'product' | 'component';
}

export function EquipmentForm({ mode }: EquipmentFormProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    kind: 'AIO',
    brand: '',
    model: '',
    serialNumber: '',
    partNumber: '',
    status: 'available',
    issues: '',
    location: 'Laboratorios',
    name: '',
    manufacturer: '',
    isFactory: true,
    isWorking: true,
  });

  const update = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (mode === 'product') {
        await gql(CREATE_PRODUCT_MUTATION, {
          input: {
            kind: form.kind,
            brand: form.brand,
            model: form.model,
            serialNumber: form.serialNumber,
            partNumber: form.partNumber,
            status: form.status,
            issues: form.issues || null,
            location: form.location,
          },
        });
      } else {
        await gql(CREATE_COMPONENT_MUTATION, {
          input: {
            name: form.name,
            model: form.model,
            manufacturer: form.manufacturer,
            serialNumber: form.serialNumber,
            partNumber: form.partNumber,
            isFactory: form.isFactory,
            isWorking: form.isWorking,
          },
        });
      }
      navigate(ROUTES.INVENTORY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.INVENTORY}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {mode === 'product' ? 'Nuevo equipo' : 'Nuevo componente'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'product' ? 'Datos del equipo' : 'Datos del componente'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'product' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="kind">Tipo</Label>
                    <select
                      id="kind"
                      value={form.kind}
                      onChange={e => update('kind', e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-card/50 px-3 text-sm text-foreground focus:outline-none focus:border-ring"
                    >
                      {EQUIPMENT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Ubicación</Label>
                    <select
                      id="location"
                      value={form.location}
                      onChange={e => update('location', e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-card/50 px-3 text-sm text-foreground focus:outline-none focus:border-ring"
                    >
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="brand">Marca</Label>
                    <Input id="brand" value={form.brand} onChange={e => update('brand', e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" value={form.model} onChange={e => update('model', e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="serialNumber">N° de serie</Label>
                    <Input id="serialNumber" value={form.serialNumber} onChange={e => update('serialNumber', e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partNumber">Part number</Label>
                    <Input id="partNumber" value={form.partNumber} onChange={e => update('partNumber', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="issues">Fallas / Observaciones</Label>
                  <Textarea id="issues" value={form.issues} onChange={e => update('issues', e.target.value)} placeholder="Opcional" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nombre del componente</Label>
                    <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" value={form.model} onChange={e => update('model', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input id="manufacturer" value={form.manufacturer} onChange={e => update('manufacturer', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="serialNumber">N° de serie</Label>
                    <Input id="serialNumber" value={form.serialNumber} onChange={e => update('serialNumber', e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partNumber">Part number</Label>
                    <Input id="partNumber" value={form.partNumber} onChange={e => update('partNumber', e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isFactory} onChange={e => update('isFactory', e.target.checked)} className="h-4 w-4 rounded" />
                    <span className="text-sm text-foreground">¿Es de fábrica?</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isWorking} onChange={e => update('isWorking', e.target.checked)} className="h-4 w-4 rounded" />
                    <span className="text-sm text-foreground">¿Está funcionando?</span>
                  </label>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="secondary" asChild>
                <Link to={ROUTES.INVENTORY}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
