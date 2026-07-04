import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
} // Parseo de fechas

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
} // Parseo de fecha y hora

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  return "ahora mismo";
} // Parseo de tiempo relativo

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("No data returned from API");
  }

  return json.data;
} // Solicitudes a la API con metodos y gestion de errores

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
} // Generacion de ID

export function isOverdue(returnDate: string): boolean {
  return new Date(returnDate) < new Date();
} // Verificacion si esta fuera de fecha

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
} // Truncado de datos
