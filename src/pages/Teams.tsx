import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Mail, Trash2, Crown, Shield, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  expires_at: string;
  created_at: string;
}

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Invite member form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>("member");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
      fetchInvitations(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data: teamMembersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Fetch profiles for each member
      const memberProfiles = await Promise.all(
        (teamMembersData || []).map(async (member) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            profiles: profileData || { email: '', full_name: null },
          };
        })
      );

      setMembers(memberProfiles);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchInvitations = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    if (!teamSlug || teamSlug === generateSlug(teamName)) {
      setTeamSlug(generateSlug(value));
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          slug: teamSlug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Team created successfully",
      });

      setShowCreateForm(false);
      setTeamName("");
      setTeamSlug("");
      fetchTeams();
      setSelectedTeam(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setIsInviting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate random token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: selectedTeam.id,
          email: inviteEmail,
          role: inviteRole,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Invitation sent!",
        description: `Invited ${inviteEmail} to join the team`,
      });

      setShowInviteForm(false);
      setInviteEmail("");
      setInviteRole("member");
      fetchInvitations(selectedTeam.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === userId) {
        toast({
          title: "Error",
          description: "You cannot remove yourself from the team",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team",
      });

      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation cancelled",
      });

      if (selectedTeam) {
        fetchInvitations(selectedTeam.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      admin: "secondary",
      member: "outline",
    };
    return <Badge variant={variants[role] || "outline"}>{role}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team members
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-ocean hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
            <CardDescription>
              Create a workspace to collaborate with others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name *</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => handleTeamNameChange(e.target.value)}
                  placeholder="Acme Marketing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-slug">Team Slug *</Label>
                <Input
                  id="team-slug"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(generateSlug(e.target.value))}
                  placeholder="acme-marketing"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-gradient-ocean hover:opacity-90"
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a team to collaborate with others on pages and resources
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-ocean hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Team Selector */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                      selectedTeam?.id === team.id ? 'bg-accent border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground">@{team.slug}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Details */}
          <Card className="lg:col-span-3">
            {selectedTeam ? (
              <>
                <CardHeader>
                  <CardTitle>{selectedTeam.name}</CardTitle>
                  <CardDescription>@{selectedTeam.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="members">
                    <TabsList>
                      <TabsTrigger value="members">
                        <Users className="w-4 h-4 mr-2" />
                        Members ({members.length})
                      </TabsTrigger>
                      <TabsTrigger value="invitations">
                        <Mail className="w-4 h-4 mr-2" />
                        Invitations ({invitations.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setShowInviteForm(true)}
                          variant="outline"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </div>

                      {showInviteForm && (
                        <Card>
                          <CardContent className="pt-6">
                            <form onSubmit={inviteMember} className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="invite-email">Email *</Label>
                                  <Input
                                    id="invite-email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="invite-role">Role *</Label>
                                  <Select
                                    value={inviteRole}
                                    onValueChange={(value: 'member' | 'admin') => setInviteRole(value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="member">Member</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowInviteForm(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isInviting}>
                                  {isInviting ? "Sending..." : "Send Invitation"}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {member.profiles.full_name || 'No name'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {member.profiles.email}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(member.role)}
                                    {getRoleBadge(member.role)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(member.joined_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {member.role !== 'owner' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeMember(member.id, member.user_id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="invitations" className="space-y-4">
                      {invitations.length === 0 ? (
                        <div className="text-center py-12">
                          <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No pending invitations
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invitations.map((invitation) => (
                                <TableRow key={invitation.id}>
                                  <TableCell className="font-medium">
                                    {invitation.email}
                                  </TableCell>
                                  <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                                  <TableCell>
                                    {new Date(invitation.expires_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => cancelInvitation(invitation.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Select a team to view details</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Teams;
