export type UserRole = "root_admin" | "admin" | "tecnico" | "solicitante";

export interface User {
  id: string;
  name: string;
  dni: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentStatus = "available" | "in_use" | "in_repair" | "retired";
export type Location = "Laboratorios" | "Salones" | "Administración" | "Otros";

export interface Product {
  id: string;
  type: "product";
  kind: string;
  brand: string;
  model: string;
  serialNumber: string;
  partNumber: string;
  status: EquipmentStatus;
  issues: string | null;
  location: Location;
  components: Component[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Component {
  id: string;
  type: "component";
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  partNumber: string;
  isFactory: boolean;
  isWorking: boolean;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type Equipment = Product | Component;

export type TicketStatus = "pending" | "in_progress" | "in_resolution" | "resolved";
export type TicketCategory = "hardware" | "software" | "network" | "other";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  submittedBy: User;
  assignedTo: User | null;
  equipmentId: string | null;
  equipment: Product | null;
  diagnosis: string | null;
  corrected: boolean | null;
  actionsTaken: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export type LoanStatus = "pending" | "approved" | "active" | "overdue" | "returned";

export interface Loan {
  id: string;
  equipment: Product;
  user: User;
  status: LoanStatus;
  approvedBy: User | null;
  issueDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  rejectionReason: string | null;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = "lab_preparation" | "software_installation" | "equipment_setup" | "other";
export type ServiceStatus = "pending" | "approved" | "in_progress" | "completed" | "rejected";

export interface ServiceRequest {
  id: string;
  type: ServiceType;
  status: ServiceStatus;
  requestedBy: User;
  description: string;
  labNumber: string | null;
  softwareName: string | null;
  equipmentId: string | null;
  resolutionText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  operation: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string | null;
}

export interface DashboardStats {
  totalEquipment: number;
  openTickets: number;
  activeLoans: number;
  pendingServices: number;
  ticketsByStatus: Array<{ status: TicketStatus; count: number }>;
  servicesByPeriod: Array<{ date: string; count: number }>;
}

export interface AuthUser extends User {
  token: string;
}

export type FontSize = "sm" | "md" | "lg" | "xl";
export type Theme = "light" | "dark";

export interface ThemeSettings {
  theme: Theme;
  fontSize: FontSize;
  highContrast: boolean;
  dyslexicFont: boolean;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
