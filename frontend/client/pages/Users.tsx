import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";
import { userApi, User, UserRole } from "@shared/api";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  FileEdit,
  Search,
  MoreVertical,
  Check,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as UserRole,
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      const response = await userApi.getUsers(params);
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await userApi.createUser(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "User created successfully!",
        });
        setShowCreateForm(false);
        setFormData({ name: "", email: "", password: "", role: "viewer" });
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await userApi.updateUserRole(userId, newRole);
      if (response.success) {
        toast({
          title: "Success",
          description: "User role updated successfully!",
        });
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await userApi.updateUserStatus(userId, !currentStatus);
      if (response.success) {
        toast({
          title: "Success",
          description: `User ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        });
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await userApi.deleteUser(userId);
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully!",
        });
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      admin: "bg-red-500/20 text-red-400 border-red-500/50",
      editor: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      viewer: "bg-green-500/20 text-green-400 border-green-500/50",
    };
    return badges[role] || badges.viewer;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "editor":
        return <FileEdit className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
        <AnimatedBackground interactive={false} />
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <img
              src="/reshot-icon-video-tutorials-ZUNFC7L9TP.svg"
              alt="Loading..."
              className="w-16 h-16 mx-auto mb-4 animate-spin"
            />
            <p className="text-foreground/60">Loading users...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">User Management</h1>
                <p className="text-foreground/60">
                  Manage users and their roles in your organization
                </p>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary text-white gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create User
              </Button>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
              <div className="glass-elevated rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Create New User</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        placeholder="Minimum 6 characters"
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value as UserRole })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="btn-primary text-white"
                    >
                      {isCreating ? "Creating..." : "Create User"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({ name: "", email: "", password: "", role: "viewer" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="glass-elevated rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-elevated rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-foreground/60">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id || `user-${index}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              {user.createdAt && (
                                <p className="text-xs text-foreground/60">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground/80">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value) => {
                                if (user.id) {
                                  handleUpdateRole(user.id, value as UserRole);
                                }
                              }}
                            >
                              <SelectTrigger className={`w-32 border ${getRoleBadge(user.role)}`}>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(user.role)}
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Viewer
                                  </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                  <div className="flex items-center gap-2">
                                    <FileEdit className="w-4 h-4" />
                                    Editor
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.isActive !== false ? (
                              <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
                                Inactive
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (user.id) {
                                  handleToggleStatus(user.id, user.isActive !== false);
                                }
                              }}
                              className="h-7 w-7 p-0"
                            >
                              {user.isActive !== false ? (
                                <X className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (user.id) {
                                handleDeleteUser(user.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
