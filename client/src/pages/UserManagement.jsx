import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  Search,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  payroll_admin: "Payroll Admin",
  production_accountant: "Production Accountant",
  department_head: "Department Head",
  crew_member: "Crew Member",
};

const ROLE_COLORS = {
  super_admin: "bg-red-500/15 text-red-500 border-red-500/30",
  payroll_admin: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  production_accountant:
    "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  department_head: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  crew_member: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const ASSIGNABLE_ROLES = [
  { value: "crew_member", label: "Crew Member" },
  { value: "department_head", label: "Department Head" },
  { value: "production_accountant", label: "Production Accountant" },
  { value: "payroll_admin", label: "Payroll Admin" },
];

function generatePassword(length = 12) {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "crew_member",
    password: generatePassword(),
  });

  // Queries
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/auth/users");
      return data.data.users;
    },
  });

  const users = usersData || [];

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post("/auth/register", userData);
      return data.data.user;
    },
    onSuccess: (_user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreatedCredentials({
        email: newUser.email,
        password: newUser.password,
      });
      setAddOpen(false);
      setCredentialsOpen(true);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "crew_member",
        password: generatePassword(),
      });
      toast.success("User created successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/auth/users/${id}`, updates);
      return data.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update user");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const { data } = await api.put(`/auth/users/${id}`, { isActive });
      return data.data.user;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `${user.firstName} ${user.lastName} ${user.isActive ? "activated" : "deactivated"}`
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = users;
    if (roleFilter && roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, roleFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const byRole = {};
    users.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
    });
    return { total, active, byRole };
  }, [users]);

  // Handlers
  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    createUserMutation.mutate({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone || undefined,
      role: newUser.role,
      password: newUser.password,
    });
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser._id,
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      phone: editingUser.phone,
      role: editingUser.role,
      isActive: editingUser.isActive,
    });
  };

  const openEdit = (user) => {
    setEditingUser({ ...user });
    setEditOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage crew members and admin accounts
          </p>
        </div>
        <Button
          onClick={() => {
            setNewUser({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              role: "crew_member",
              password: generatePassword(),
            });
            setAddOpen(true);
          }}
          className="cursor-pointer"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Crew Member
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(stats.byRole.super_admin || 0) +
                    (stats.byRole.payroll_admin || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <UserX className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.total - stats.active}
                </p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 && "s"}{" "}
                found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="payroll_admin">Payroll Admin</SelectItem>
                  <SelectItem value="production_accountant">
                    Prod. Accountant
                  </SelectItem>
                  <SelectItem value="department_head">Dept. Head</SelectItem>
                  <SelectItem value="crew_member">Crew Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Phone
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Joined
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${ROLE_COLORS[user.role] || ""}`}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.isActive
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => openEdit(user)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {user._id !== currentUser?._id && (
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={(checked) =>
                                toggleActiveMutation.mutate({
                                  id: user._id,
                                  isActive: checked,
                                })
                              }
                              className="scale-75"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Crew Member</DialogTitle>
            <DialogDescription>
              Create a new user account. Credentials will be shown after
              creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(val) =>
                  setNewUser({ ...newUser, role: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer shrink-0"
                  onClick={() =>
                    setNewUser({ ...newUser, password: generatePassword() })
                  }
                >
                  Generate
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Minimum 6 characters. Click Generate for a random password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="cursor-pointer"
            >
              {createUserMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog (shown after successful creation) */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Created</DialogTitle>
            <DialogDescription>
              Share these credentials with the crew member. The password cannot
              be retrieved later.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="font-mono text-sm">
                      {createdCredentials.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => copyToClipboard(createdCredentials.email)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Password
                    </p>
                    <p className="font-mono text-sm">
                      {createdCredentials.password}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(createdCredentials.password)
                    }
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() =>
                  copyToClipboard(
                    `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                  )
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Both
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setCredentialsOpen(false);
                setCreatedCredentials(null);
              }}
              className="cursor-pointer"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Email cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editingUser.lastName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editingUser.phone || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val) =>
                    setEditingUser({ ...editingUser, role: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Account Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive users cannot log in
                  </p>
                </div>
                <Switch
                  checked={editingUser.isActive}
                  onCheckedChange={(checked) =>
                    setEditingUser({ ...editingUser, isActive: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditingUser(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
              className="cursor-pointer"
            >
              {updateUserMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
