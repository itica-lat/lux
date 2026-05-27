import type { Ticket } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TICKET_STATUS_CONFIG, EQUIPMENT_STATUS_CONFIG } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SummaryStepProps {
  ticket: Ticket;
  diagnosis: string;
  corrected: boolean | null;
  actionsTaken: string;
  onActionsChange: (v: string) => void;
  readOnly?: boolean;
}

export function SummaryStep({
  ticket,
  diagnosis,
  corrected,
  actionsTaken,
  onActionsChange,
  readOnly = false,
}: SummaryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Resumen final</h2>
        {ticket.equipment && (
          <p className="text-xs text-muted-foreground">
            {ticket.equipment.location} · {ticket.equipment.serialNumber}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-black/3 border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Estado del ticket
          </span>
          <Badge color={TICKET_STATUS_CONFIG[ticket.status].color}>
            {TICKET_STATUS_CONFIG[ticket.status].label}
          </Badge>
        </div>
        {ticket.equipment && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Estado del equipo
            </span>
            <Badge color={EQUIPMENT_STATUS_CONFIG[ticket.equipment.status].color}>
              {EQUIPMENT_STATUS_CONFIG[ticket.equipment.status].label}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            ¿Corregido?
          </span>
          <Badge
            color={corrected === true ? "success" : corrected === false ? "destructive" : "muted"}
          >
            {corrected === true ? "Sí" : corrected === false ? "No" : "Sin confirmar"}
          </Badge>
        </div>
      </div>

      {diagnosis && (
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium block mb-1.5">
            Diagnóstico
          </span>
          <p className="text-sm text-foreground leading-relaxed">{diagnosis}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Acciones tomadas</Label>
        <Textarea
          value={actionsTaken}
          onChange={(e) => onActionsChange(e.target.value)}
          placeholder="Describí las acciones tomadas para resolver el ticket..."
          className="h-32"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
