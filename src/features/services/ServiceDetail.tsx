import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAsync } from "@/hooks/useSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { gql, formatDate } from "@/lib/utils";
import { SERVICE_STATUS_CONFIG, SERVICE_TYPE_LABELS, ROUTES } from "@/lib/constants";
import type { ServiceRequest, ServiceStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SERVICE_QUERY = `
 query GetServiceRequest($id: ID!) {
 serviceRequest(id: $id) {
 id type status description labNumber softwareName equipmentId resolutionText
 requestedBy { id name email }
 createdAt updatedAt
 }
 }
`; // Query para service ID, status, description, labNumber, softwareName, equipmentId, resolutionText, requestedBy (id, name, email), createdAt, updatedAt

const UPDATE_SERVICE_MUTATION = `
 mutation UpdateServiceRequest($id: ID!, $input: ServiceRequestUpdateInput!) {
 updateServiceRequest(id: $id, input: $input) { id status }
 }
`; // Alteracion del Service

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>(); // Variable constante ID con parametros String
  const { hasRole } = useAuth(); // Verificacion de roles con Auth
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ServiceStatus | "">(""); // Actualizacion de Estatus con parametro de estado de servicio
  const [resolution, setResolution] = useState(""); // Setear resolucion y establecer

  const { data, isLoading, error, refetch } = useAsync<{ serviceRequest: ServiceRequest | null }>(
    () => gql(SERVICE_QUERY, { id }),
    [id],
  ); // Solicitud (Fetch) de servicio por parte del frontend

  const service = data?.serviceRequest; // Verificacion e informacion (Si existe) de servicio
  const canManage = hasRole("root_admin", "admin", "tecnico"); // Verificacion si puede gestionar

  const handleUpdate = async () => {
    if (!id || !newStatus) return;
    setSaving(true);
    try {
      await gql(UPDATE_SERVICE_MUTATION, {
        id,
        input: {
          status: newStatus,
          resolutionText:
            newStatus === "completed" || newStatus === "rejected" ? resolution : undefined,
        },
      });
      refetch();
      setNewStatus("");
      setResolution("");
    } finally {
      setSaving(false);
    }
  }; // Actualizacion de servicio (datos)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.SERVICES}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground flex-1">
          Solicitud de servicio
        </h1>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          Error: {error}
        </div>
      )}

      {!isLoading && service && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{SERVICE_TYPE_LABELS[service.type]}</CardTitle>
                <Badge color={SERVICE_STATUS_CONFIG[service.status].color}>
                  {SERVICE_STATUS_CONFIG[service.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                    Solicitante
                  </p>
                  <p className="text-foreground">{service.requestedBy.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                    Fecha
                  </p>
                  <p className="text-foreground">{formatDate(service.createdAt)}</p>
                </div>
                {service.labNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                      Laboratorio
                    </p>
                    <p className="text-foreground">N° {service.labNumber}</p>
                  </div>
                )}
                {service.softwareName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                      Software
                    </p>
                    <p className="text-foreground">{service.softwareName}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">
                  Descripción
                </p>
                <p className="text-sm text-foreground leading-relaxed">{service.description}</p>
              </div>
              {service.resolutionText && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">
                    Resolución
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {service.resolutionText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canManage && !["completed", "rejected"].includes(service.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Actualizar estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nuevo estado</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ServiceStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newStatus === "completed" || newStatus === "rejected") && (
                  <div className="space-y-1.5">
                    <Label>Texto de resolución</Label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describí la resolución o motivo de rechazo..."
                      className="h-24"
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleUpdate} disabled={saving || !newStatus}>
                    {saving ? "Guardando..." : "Actualizar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
