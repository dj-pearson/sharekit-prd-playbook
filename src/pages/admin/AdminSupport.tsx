import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  LifeBuoy,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  MessageSquare,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'billing' | 'technical' | 'feature' | 'bug' | 'account' | 'other';
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  user_plan?: string;
  message_count?: number;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  is_admin: boolean;
  is_internal: boolean;
  message: string;
  created_at: string;
  sender_name?: string;
}

export default function AdminSupport() {
  const { hasPermission, logActivity, adminUser } = useAdmin();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    loadTickets();
    logActivity('page_view', 'admin_support');
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, activeTab]);

  async function loadTickets() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
            email,
            display_name,
            subscription_tier
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get message counts for each ticket
      const ticketsWithCounts = await Promise.all(
        (data || []).map(async (ticket) => {
          const { count } = await supabase
            .from('support_messages')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);

          return {
            ...ticket,
            user_email: ticket.profiles?.email,
            user_name: ticket.profiles?.display_name,
            user_plan: ticket.profiles?.subscription_tier,
            message_count: count || 0,
          };
        })
      );

      setTickets(ticketsWithCounts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  function filterTickets() {
    let filtered = [...tickets];

    if (activeTab !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === activeTab);
    }

    setFilteredTickets(filtered);
  }

  async function handleViewTicket(ticket: SupportTicket) {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);
    await loadMessages(ticket.id);
    logActivity('view_ticket', 'support_ticket', ticket.id);
  }

  async function loadMessages(ticketId: string) {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select(`
          *,
          profiles:sender_id (
            display_name,
            email
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithNames = (data || []).map((msg) => ({
        ...msg,
        sender_name: msg.is_admin ? 'Admin' : (msg.profiles?.display_name || msg.profiles?.email),
      }));

      setMessages(messagesWithNames);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function handleSendMessage() {
    if (!selectedTicket || !newMessage.trim() || !adminUser) return;

    try {
      const { error } = await supabase.from('support_messages').insert({
        ticket_id: selectedTicket.id,
        sender_id: adminUser.user_id,
        is_admin: true,
        is_internal: isInternal,
        message: newMessage,
      });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket.id);
      }

      toast({
        title: 'Message Sent',
        description: isInternal ? 'Internal note added' : 'Reply sent to user',
      });

      logActivity('reply_ticket', 'support_ticket', selectedTicket.id);
      setNewMessage('');
      setIsInternal(false);
      loadMessages(selectedTicket.id);
      loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }

  async function handleUpdateStatus(status: string) {
    if (!selectedTicket) return;

    try {
      const updates: any = { status };
      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Ticket marked as ${status}`,
      });

      logActivity('update_ticket_status', 'support_ticket', selectedTicket.id, { status });
      setSelectedTicket({ ...selectedTicket, status: status as any });
      loadTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  async function handleUpdatePriority(priority: string) {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Priority Updated',
        description: `Ticket priority set to ${priority}`,
      });

      logActivity('update_ticket_priority', 'support_ticket', selectedTicket.id, { priority });
      setSelectedTicket({ ...selectedTicket, priority: priority as any });
      loadTickets();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive',
      });
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - time) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <LifeBuoy className="h-4 w-4" />;
    }
  }

  if (!hasPermission('support.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view support tickets.</p>
        </div>
      </AdminLayout>
    );
  }

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-gray-500 mt-1">
              Manage customer support requests
            </p>
          </div>
          <Button onClick={loadTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-gray-500">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                <p className="text-sm text-gray-500">Urgent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter((t) => t.status === 'resolved').length}
                </p>
                <p className="text-sm text-gray-500">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">
              Open {openCount > 0 && `(${openCount})`}
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress {inProgressCount > 0 && `(${inProgressCount})`}
            </TabsTrigger>
            <TabsTrigger value="waiting">Waiting</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <LifeBuoy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tickets found</p>
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={ticket.priority === 'urgent' ? 'border-red-300' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-medium">
                            {ticket.ticket_number}
                          </span>
                          <Badge variant={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {ticket.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user_name || ticket.user_email}
                            {ticket.user_plan && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                {ticket.user_plan}
                              </Badge>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.message_count || 0} messages
                          </span>
                          <span>Created: {formatTimeAgo(ticket.created_at)}</span>
                        </div>
                      </div>
                      {hasPermission('support.manage') && (
                        <Button
                          onClick={() => handleViewTicket(ticket)}
                          size="sm"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Ticket Dialog */}
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Ticket {selectedTicket?.ticket_number}
                <Badge variant={getPriorityColor(selectedTicket?.priority || 'normal')}>
                  {selectedTicket?.priority}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedTicket?.subject}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">User:</span>{' '}
                    <span className="text-sm">{selectedTicket.user_email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Category:</span>{' '}
                    <span className="text-sm capitalize">{selectedTicket.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Status:</span>{' '}
                    <Select
                      value={selectedTicket.status}
                      onValueChange={handleUpdateStatus}
                      disabled={!hasPermission('support.manage')}
                    >
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Priority:</span>{' '}
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={handleUpdatePriority}
                      disabled={!hasPermission('support.manage')}
                    >
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-medium mb-3">Conversation</h4>
                  <ScrollArea className="h-96 border rounded-lg p-4">
                    <div className="space-y-4">
                      {/* Initial ticket message */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {selectedTicket.user_name || selectedTicket.user_email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedTicket.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{selectedTicket.description}</p>
                      </div>

                      {/* Messages */}
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-lg p-4 ${
                            message.is_internal
                              ? 'bg-yellow-50 border border-yellow-200'
                              : message.is_admin
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {message.sender_name}
                            </span>
                            {message.is_internal && (
                              <Badge variant="outline" className="text-xs">
                                Internal
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Reply Form */}
                {hasPermission('support.manage') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Reply:</label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        Internal note (not visible to user)
                      </label>
                    </div>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isInternal ? 'Add Internal Note' : 'Send Reply'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
