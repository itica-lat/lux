import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useAsync } from '@/hooks/useSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { Ticket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WizardSkeleton } from '@/components/skeletons/WizardSkeleton';
import { TicketWizard } from './TicketWizard';

const TICKET_QUERY = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id title description category status
      submittedBy { id name email role }
      assignedTo { id name }
      equipmentId
      equipment { id type kind brand model serialNumber partNumber status issues location components { id name model manufacturer serialNumber partNumber isFactory isWorking } updatedAt createdAt deletedAt }
      diagnosis corrected actionsTaken
      createdAt updatedAt resolvedAt
    }
  }
`;

const CLAIM_TICKET_MUTATION = `
  mutation ClaimTicket($id: ID!) {
    claimTicket(id: $id) { id status assignedTo { id name } }
  }
`;

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();

  const { data, isLoading, error, refetch } = useAsync<{ ticket: Ticket | null }>(
    () => gql(TICKET_QUERY, { id }),
    [id]
  );

  const ticket = data?.ticket;
  const canComplete = hasRole('root_admin', 'admin', 'tecnico');

  const handleClaim = async () => {
    if (!id) return;
    try {
      await gql(CLAIM_TICKET_MUTATION, { id });
      refetch();
    } catch {
      // TODO: toast error
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.TICKETS}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white flex-1 truncate">
          {isLoading ? '...' : (ticket?.title ?? 'Ticket no encontrado')}
        </h1>
        {ticket && !ticket.assignedTo && canComplete && (
          <Button variant="secondary" size="sm" onClick={handleClaim}>
            <UserCheck className="h-3.5 w-3.5" />
            Tomar ticket
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-[rgba(255,69,58,0.08)] border border-[rgba(255,69,58,0.2)] p-4 text-sm text-[rgb(255,69,58)]">
          Error: {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <WizardSkeleton />
          ) : ticket ? (
            <TicketWizard
              ticket={ticket}
              onComplete={refetch}
              canComplete={canComplete}
            />
          ) : (
            <div className="text-center py-16 text-[#86868b]">Ticket no encontrado</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
