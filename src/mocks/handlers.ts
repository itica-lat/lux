import { graphql, HttpResponse } from 'msw';
import { mockUsers, mockPasswords } from './data/users';
import { mockProducts, mockComponents } from './data/equipment';
import { mockTickets } from './data/tickets';
import { mockLoans } from './data/loans';
import { mockServices } from './data/services';
import { mockActivityLogs } from './generators';
import type {
  User,
  Product,
  Component,
  Ticket,
  Loan,
  ServiceRequest,
  DashboardStats,
  TicketStatus,
  LoanStatus,
  ServiceStatus,
} from '@/lib/types';

function filterByStatus<T extends { status: string }>(items: T[], status?: string): T[] {
  if (!status) return items;
  return items.filter(i => i.status === status);
}

export const handlers = [
  graphql.query('Login', ({ variables }) => {
    const { dni, password } = variables as { dni: string; password: string };
    const user = mockUsers.find(u => u.dni === dni && u.isActive);
    if (!user || mockPasswords[dni] !== password) {
      return HttpResponse.json({
        errors: [{ message: 'Credenciales inválidas' }],
      });
    }
    return HttpResponse.json({
      data: {
        login: { ...user, token: `mock-token-${user.id}` },
      },
    });
  }),

  graphql.query('GetMe', () => {
    const stored = localStorage.getItem('lux_auth');
    if (!stored) return HttpResponse.json({ data: { me: null } });
    const user = JSON.parse(stored) as User;
    return HttpResponse.json({ data: { me: user } });
  }),

  graphql.query('GetUsers', ({ variables }) => {
    const { role, isActive } = variables as { role?: string; isActive?: boolean };
    let users = [...mockUsers];
    if (role) users = users.filter(u => u.role === role);
    if (isActive !== undefined) users = users.filter(u => u.isActive === isActive);
    return HttpResponse.json({ data: { users } });
  }),

  graphql.query('GetUser', ({ variables }) => {
    const { id } = variables as { id: string };
    const user = mockUsers.find(u => u.id === id);
    return HttpResponse.json({ data: { user: user ?? null } });
  }),

  graphql.query('GetProducts', ({ variables }) => {
    const { status, location } = variables as { status?: string; location?: string };
    let products = mockProducts.filter(p => p.deletedAt === null);
    if (status) products = products.filter(p => p.status === status);
    if (location) products = products.filter(p => p.location === location);
    return HttpResponse.json({ data: { products } });
  }),

  graphql.query('GetProduct', ({ variables }) => {
    const { id } = variables as { id: string };
    const product = mockProducts.find(p => p.id === id) ?? null;
    return HttpResponse.json({ data: { product } });
  }),

  graphql.query('GetComponents', ({ variables }) => {
    const { productId, isWorking } = variables as { productId?: string; isWorking?: boolean };
    let components = mockComponents.filter(c => c.deletedAt === null);
    if (productId !== undefined) {
      components = components.filter(c => c.productId === productId);
    }
    if (isWorking !== undefined) {
      components = components.filter(c => c.isWorking === isWorking);
    }
    return HttpResponse.json({ data: { components } });
  }),

  graphql.query('GetComponent', ({ variables }) => {
    const { id } = variables as { id: string };
    const component = mockComponents.find(c => c.id === id) ?? null;
    return HttpResponse.json({ data: { component } });
  }),

  graphql.query('GetTickets', ({ variables }) => {
    const { status, assignedToId, submittedById } = variables as {
      status?: TicketStatus;
      assignedToId?: string;
      submittedById?: string;
    };
    let tickets = [...mockTickets];
    if (status) tickets = tickets.filter(t => t.status === status);
    if (assignedToId) tickets = tickets.filter(t => t.assignedTo?.id === assignedToId);
    if (submittedById) tickets = tickets.filter(t => t.submittedBy.id === submittedById);
    return HttpResponse.json({ data: { tickets } });
  }),

  graphql.query('GetTicket', ({ variables }) => {
    const { id } = variables as { id: string };
    const ticket = mockTickets.find(t => t.id === id) ?? null;
    return HttpResponse.json({ data: { ticket } });
  }),

  graphql.query('GetOolTickets', () => {
    const ool = mockTickets.filter(t => t.status === 'pending' && t.assignedTo === null);
    return HttpResponse.json({ data: { oolTickets: ool } });
  }),

  graphql.query('GetLoans', ({ variables }) => {
    const { status, userId } = variables as { status?: LoanStatus; userId?: string };
    let loans = [...mockLoans];
    if (status) loans = filterByStatus<Loan>(loans, status);
    if (userId) loans = loans.filter(l => l.user.id === userId);
    return HttpResponse.json({ data: { loans } });
  }),

  graphql.query('GetLoan', ({ variables }) => {
    const { id } = variables as { id: string };
    const loan = mockLoans.find(l => l.id === id) ?? null;
    return HttpResponse.json({ data: { loan } });
  }),

  graphql.query('GetServiceRequests', ({ variables }) => {
    const { status, requestedById } = variables as { status?: ServiceStatus; requestedById?: string };
    let services = [...mockServices];
    if (status) services = filterByStatus<ServiceRequest>(services, status);
    if (requestedById) services = services.filter(s => s.requestedBy.id === requestedById);
    return HttpResponse.json({ data: { serviceRequests: services } });
  }),

  graphql.query('GetServiceRequest', ({ variables }) => {
    const { id } = variables as { id: string };
    const serviceRequest = mockServices.find(s => s.id === id) ?? null;
    return HttpResponse.json({ data: { serviceRequest } });
  }),

  graphql.query('GetDashboardStats', () => {
    const activeProducts = mockProducts.filter(p => p.deletedAt === null);
    const openTickets = mockTickets.filter(t => t.status !== 'resolved');
    const activeLoans = mockLoans.filter(l => ['active', 'approved', 'overdue'].includes(l.status));
    const pendingServices = mockServices.filter(s => s.status === 'pending');

    const ticketsByStatus: DashboardStats['ticketsByStatus'] = [
      { status: 'pending', count: mockTickets.filter(t => t.status === 'pending').length },
      { status: 'in_progress', count: mockTickets.filter(t => t.status === 'in_progress').length },
      { status: 'in_resolution', count: mockTickets.filter(t => t.status === 'in_resolution').length },
      { status: 'resolved', count: mockTickets.filter(t => t.status === 'resolved').length },
    ];

    const servicesByPeriod: DashboardStats['servicesByPeriod'] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const count = mockServices.filter(s => s.createdAt.startsWith(dateStr)).length +
        Math.floor(Math.random() * 3);
      return { date: dateStr, count };
    });

    const stats: DashboardStats = {
      totalEquipment: activeProducts.length,
      openTickets: openTickets.length,
      activeLoans: activeLoans.length,
      pendingServices: pendingServices.length,
      ticketsByStatus,
      servicesByPeriod,
    };

    return HttpResponse.json({ data: { dashboardStats: stats } });
  }),

  graphql.query('GetActivityLogs', ({ variables }) => {
    const { userId, operation, startDate, endDate } = variables as {
      userId?: string;
      operation?: string;
      startDate?: string;
      endDate?: string;
    };
    let logs = [...mockActivityLogs];
    if (userId) logs = logs.filter(l => l.userId === userId);
    if (operation) logs = logs.filter(l => l.operation === operation);
    if (startDate) logs = logs.filter(l => l.timestamp >= startDate);
    if (endDate) logs = logs.filter(l => l.timestamp <= endDate);
    return HttpResponse.json({ data: { activityLogs: logs } });
  }),

  graphql.mutation('CreateTicket', ({ variables }) => {
    const { input } = variables as {
      input: { title: string; description: string; category: string; equipmentId?: string };
    };
    const stored = localStorage.getItem('lux_auth');
    const user = stored ? JSON.parse(stored) as User : mockUsers[6];
    const equipment = input.equipmentId
      ? (mockProducts.find(p => p.id === input.equipmentId) ?? null)
      : null;
    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category as Ticket['category'],
      status: 'pending',
      submittedBy: user,
      assignedTo: null,
      equipmentId: input.equipmentId ?? null,
      equipment,
      diagnosis: null,
      corrected: null,
      actionsTaken: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };
    mockTickets.push(newTicket);
    return HttpResponse.json({ data: { createTicket: newTicket } });
  }),

  graphql.mutation('ClaimTicket', ({ variables }) => {
    const { id } = variables as { id: string };
    const stored = localStorage.getItem('lux_auth');
    const user = stored ? JSON.parse(stored) as User : mockUsers[3];
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) return HttpResponse.json({ errors: [{ message: 'Ticket no encontrado' }] });
    ticket.assignedTo = user;
    ticket.status = 'in_progress';
    ticket.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { claimTicket: ticket } });
  }),

  graphql.mutation('UpdateTicket', ({ variables }) => {
    const { id, input } = variables as { id: string; input: Partial<Ticket> };
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) return HttpResponse.json({ errors: [{ message: 'Ticket no encontrado' }] });
    Object.assign(ticket, input, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ data: { updateTicket: ticket } });
  }),

  graphql.mutation('CompleteTicket', ({ variables }) => {
    const { id, input } = variables as {
      id: string;
      input: { diagnosis: string; corrected: boolean; actionsTaken: string };
    };
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) return HttpResponse.json({ errors: [{ message: 'Ticket no encontrado' }] });
    ticket.status = 'resolved';
    ticket.diagnosis = input.diagnosis;
    ticket.corrected = input.corrected;
    ticket.actionsTaken = input.actionsTaken;
    ticket.resolvedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { completeTicket: ticket } });
  }),

  graphql.mutation('CreateLoan', ({ variables }) => {
    const { input } = variables as {
      input: {
        equipmentId: string;
        userId: string;
        issueDate: string;
        returnDate: string;
        componentIds?: string[];
      };
    };
    const stored = localStorage.getItem('lux_auth');
    const approver = stored ? JSON.parse(stored) as User : mockUsers[1];
    const equipment = mockProducts.find(p => p.id === input.equipmentId);
    const loanUser = mockUsers.find(u => u.id === input.userId);
    if (!equipment || !loanUser) {
      return HttpResponse.json({ errors: [{ message: 'Equipo o usuario no encontrado' }] });
    }
    const components = input.componentIds
      ? mockComponents.filter(c => input.componentIds!.includes(c.id))
      : [];
    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      equipment,
      user: loanUser,
      status: 'pending',
      approvedBy: approver,
      issueDate: input.issueDate,
      returnDate: input.returnDate,
      actualReturnDate: null,
      rejectionReason: null,
      components,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockLoans.push(newLoan);
    return HttpResponse.json({ data: { createLoan: newLoan } });
  }),

  graphql.mutation('ApproveLoan', ({ variables }) => {
    const { id } = variables as { id: string };
    const loan = mockLoans.find(l => l.id === id);
    if (!loan) return HttpResponse.json({ errors: [{ message: 'Préstamo no encontrado' }] });
    loan.status = 'approved';
    loan.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { approveLoan: loan } });
  }),

  graphql.mutation('ReturnLoan', ({ variables }) => {
    const { id } = variables as { id: string };
    const loan = mockLoans.find(l => l.id === id);
    if (!loan) return HttpResponse.json({ errors: [{ message: 'Préstamo no encontrado' }] });
    loan.status = 'returned';
    loan.actualReturnDate = new Date().toISOString();
    loan.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { returnLoan: loan } });
  }),

  graphql.mutation('CreateServiceRequest', ({ variables }) => {
    const { input } = variables as {
      input: {
        type: string;
        description: string;
        labNumber?: string;
        softwareName?: string;
        equipmentId?: string;
      };
    };
    const stored = localStorage.getItem('lux_auth');
    const user = stored ? JSON.parse(stored) as User : mockUsers[6];
    const newService: ServiceRequest = {
      id: `svc-${Date.now()}`,
      type: input.type as ServiceRequest['type'],
      status: 'pending',
      requestedBy: user,
      description: input.description,
      labNumber: input.labNumber ?? null,
      softwareName: input.softwareName ?? null,
      equipmentId: input.equipmentId ?? null,
      resolutionText: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockServices.push(newService);
    return HttpResponse.json({ data: { createServiceRequest: newService } });
  }),

  graphql.mutation('UpdateServiceRequest', ({ variables }) => {
    const { id, input } = variables as {
      id: string;
      input: { status?: string; resolutionText?: string };
    };
    const service = mockServices.find(s => s.id === id);
    if (!service) return HttpResponse.json({ errors: [{ message: 'Solicitud no encontrada' }] });
    if (input.status) service.status = input.status as ServiceRequest['status'];
    if (input.resolutionText !== undefined) service.resolutionText = input.resolutionText;
    service.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { updateServiceRequest: service } });
  }),

  graphql.mutation('CreateUser', ({ variables }) => {
    const { input } = variables as {
      input: {
        name: string;
        dni: string;
        email: string;
        password?: string;
        role: string;
        isActive?: boolean;
      };
    };
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: input.name,
      dni: input.dni,
      email: input.email,
      role: input.role as User['role'],
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (input.password) {
      mockPasswords[input.dni] = input.password;
    }
    mockUsers.push(newUser);
    return HttpResponse.json({ data: { createUser: newUser } });
  }),

  graphql.mutation('UpdateUser', ({ variables }) => {
    const { id, input } = variables as {
      id: string;
      input: Partial<User & { password?: string }>;
    };
    const user = mockUsers.find(u => u.id === id);
    if (!user) return HttpResponse.json({ errors: [{ message: 'Usuario no encontrado' }] });
    const { password, ...rest } = input;
    Object.assign(user, rest, { updatedAt: new Date().toISOString() });
    if (password) mockPasswords[user.dni] = password;
    return HttpResponse.json({ data: { updateUser: user } });
  }),

  graphql.mutation('DeleteUser', ({ variables }) => {
    const { id } = variables as { id: string };
    const user = mockUsers.find(u => u.id === id);
    if (!user || user.role === 'root_admin') {
      return HttpResponse.json({ errors: [{ message: 'No se puede eliminar este usuario' }] });
    }
    user.isActive = false;
    user.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { deleteUser: true } });
  }),

  graphql.mutation('CreateProduct', ({ variables }) => {
    const { input } = variables as {
      input: {
        kind: string;
        brand: string;
        model: string;
        serialNumber: string;
        partNumber: string;
        status: string;
        issues?: string;
        location: string;
      };
    };
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      type: 'product',
      ...input,
      status: input.status as Product['status'],
      location: input.location as Product['location'],
      issues: input.issues ?? null,
      components: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    mockProducts.push(newProduct);
    return HttpResponse.json({ data: { createProduct: newProduct } });
  }),

  graphql.mutation('UpdateProduct', ({ variables }) => {
    const { id, input } = variables as { id: string; input: Partial<Product> };
    const product = mockProducts.find(p => p.id === id);
    if (!product) return HttpResponse.json({ errors: [{ message: 'Producto no encontrado' }] });
    Object.assign(product, input, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ data: { updateProduct: product } });
  }),

  graphql.mutation('SoftDeleteProduct', ({ variables }) => {
    const { id } = variables as { id: string };
    const product = mockProducts.find(p => p.id === id);
    if (!product) return HttpResponse.json({ errors: [{ message: 'Producto no encontrado' }] });
    product.deletedAt = new Date().toISOString();
    return HttpResponse.json({ data: { softDeleteProduct: true } });
  }),

  graphql.mutation('CreateComponent', ({ variables }) => {
    const { input } = variables as {
      input: {
        name: string;
        model: string;
        manufacturer: string;
        serialNumber: string;
        partNumber: string;
        isFactory: boolean;
        isWorking: boolean;
        productId?: string;
      };
    };
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      type: 'component',
      ...input,
      productId: input.productId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    mockComponents.push(newComponent);
    return HttpResponse.json({ data: { createComponent: newComponent } });
  }),

  graphql.mutation('ChangePassword', () => {
    return HttpResponse.json({ data: { changePassword: true } });
  }),

  graphql.mutation('AssignTicket', ({ variables }) => {
    const { id, technicianId } = variables as { id: string; technicianId: string };
    const ticket = mockTickets.find(t => t.id === id);
    const tech = mockUsers.find(u => u.id === technicianId);
    if (!ticket || !tech) return HttpResponse.json({ errors: [{ message: 'No encontrado' }] });
    ticket.assignedTo = tech;
    ticket.status = 'in_progress';
    ticket.updatedAt = new Date().toISOString();
    return HttpResponse.json({ data: { assignTicket: ticket } });
  }),
];
