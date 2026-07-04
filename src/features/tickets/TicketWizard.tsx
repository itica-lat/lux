import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IncidentStep } from "./steps/IncidentStep";
import { PcStatusStep } from "./steps/PcStatusStep";
import { PcHistoryStep } from "./steps/PcHistoryStep";
import { DiagnosisStep } from "./steps/DiagnosisStep";
import { SummaryStep } from "./steps/SummaryStep";
import { Button } from "@/components/ui/button";
import { gql } from "@/lib/utils";

const COMPLETE_TICKET_MUTATION = `
 mutation CompleteTicket($id: ID!, $input: TicketCompleteInput!) {
 completeTicket(id: $id, input: $input) { id status }
 }
`; // Mutacion del ticket una vez completaod

const steps = [
  { id: "incident", label: "Incidente" },
  { id: "pc-status", label: "Estado del equipo" },
  { id: "pc-history", label: "Historial" },
  { id: "diagnosis", label: "Diagnóstico" },
  { id: "summary", label: "Resumen" },
]; // Pasos que ocurren dentro del flujo del ticket

interface TicketWizardProps {
  ticket: Ticket;
  onComplete: () => void;
  canComplete: boolean;
} // Interfaz del ticket con sus props

export function TicketWizard({ ticket, onComplete, canComplete }: TicketWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState(ticket.diagnosis ?? "");
  const [corrected, setCorrected] = useState<boolean | null>(ticket.corrected ?? null);
  const [actionsTaken, setActionsTaken] = useState(ticket.actionsTaken ?? "");
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(ticket.status === "resolved");

  const isResolved = ticket.status === "resolved" || completed; // Verificacion si esta resuelto o no

  const handleComplete = async () => {
    if (!diagnosis || corrected === null) return;
    setCompleting(true);
    try {
      await gql(COMPLETE_TICKET_MUTATION, {
        id: ticket.id,
        input: { diagnosis, corrected, actionsTaken },
      });
      setCompleted(true);
      onComplete();
    } catch {
      // TODO: show error toast
    } finally {
      setCompleting(false);
    }
  }; // Flujo completo cuando se esta marcando como completado

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IncidentStep ticket={ticket} />;
      case 1:
        return <PcStatusStep ticket={ticket} />;
      case 2:
        return <PcHistoryStep ticket={ticket} />;
      case 3:
        return (
          <DiagnosisStep
            ticket={ticket}
            diagnosis={diagnosis}
            corrected={corrected}
            onDiagnosisChange={setDiagnosis}
            onCorrectedChange={setCorrected}
            readOnly={isResolved}
          />
        );
      case 4:
        return (
          <SummaryStep
            ticket={ticket}
            diagnosis={diagnosis}
            corrected={corrected}
            actionsTaken={actionsTaken}
            onActionsChange={setActionsTaken}
            readOnly={isResolved}
          />
        );
      default:
        return null;
    }
  }; // Flujo de renderizado del ticket

  return (
    <div className="flex gap-8 min-h-[500px]">
      <nav className="w-44 flex-shrink-0 pt-1">
        <ol className="space-y-1">
          {steps.map((step, i) => (
            <li key={step.id}>
              <button
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer text-left",
                  currentStep === i
                    ? "bg-card/60 text-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    currentStep === i
                      ? "bg-primary text-white"
                      : i < currentStep
                        ? "bg-[rgba(52,199,89,0.15)] text-success"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Siguiente
              </Button>
            ) : canComplete && !isResolved ? (
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={completing || !diagnosis || corrected === null}
              >
                {completing ? "Completando..." : "Marcar como completado"}
              </Button>
            ) : isResolved ? (
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Resuelto
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
