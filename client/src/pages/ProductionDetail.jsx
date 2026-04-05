import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  useProduction,
  useAddMember,
  useRemoveMember,
  useAllUsers,
} from "@/hooks/useProduction";
import { useDealMemos } from "@/hooks/useDealMemos";
import useAuthStore from "@/store/authStore";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

import {
  ChevronLeft,
  Film,
  MapPin,
  Calendar,
  Banknote,
  Users,
  Clapperboard,
  Building2,
  Globe,
  Clock,
  FileText,
  UserPlus,
  Trash2,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  pre_production: { label: "Pre-Production", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  production: { label: "In Production", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  post_production: { label: "Post-Production", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  wrapped: { label: "Wrapped", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const TYPE_LABELS = {
  feature_film: "Feature Film",
  tv_drama: "TV Drama",
  tv_comedy: "TV Comedy",
  tv_entertainment: "TV Entertainment",
  short_film: "Short Film",
  documentary: "Documentary",
  commercial: "Commercial",
  animation: "Animation",
};

const ADMIN_ROLES = ["super_admin", "payroll_admin", "production_accountant"];

// ---------------------------------------------------------------------------
// Info Field
// ---------------------------------------------------------------------------
function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || "--"}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Member Dialog
// ---------------------------------------------------------------------------
function AddMemberDialog({ productionId, existingMemberIds }) {
  const [open, setOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("");
  const { data: allUsers, isLoading: usersLoading } = useAllUsers();
  const addMember = useAddMember();

  const availableUsers = useMemo(() => {
    const users = Array.isArray(allUsers) ? allUsers : allUsers?.data || [];
    if (!users.length) return [];
    return users.filter((u) => {
      if (existingMemberIds.includes(u._id)) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [allUsers, existingMemberIds, userSearch]);

  const selectedUser = allUsers?.find((u) => u._id === selectedUserId);

  const handleSubmit = () => {
    if (!selectedUserId || !role.trim()) {
      toast.error("Please select a user and enter a role.");
      return;
    }

    addMember.mutate(
      { productionId, userId: selectedUserId, role: role.trim() },
      {
        onSuccess: () => {
          toast.success("Member added successfully");
          setOpen(false);
          setSelectedUserId("");
          setRole("");
          setUserSearch("");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to add member");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div role="button" tabIndex={0} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer">
          <UserPlus className="h-4 w-4" />
          Add Member
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to Production</DialogTitle>
          <DialogDescription>
            Search for a user and assign their role on this production.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User search and selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUserId("");
                    setUserSearch("");
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border">
                  {usersLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading users...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {userSearch ? "No matching users found" : "No available users"}
                    </div>
                  ) : (
                    availableUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                        onClick={() => setSelectedUserId(u._id)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {u.firstName?.[0]}
                          {u.lastName?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {u.role?.replace(/_/g, " ")}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Role input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Production Role</label>
            <Input
              placeholder='e.g. "DOP", "1st AD", "Gaffer", "Line Producer"'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedUserId || !role.trim() || addMember.isPending}
            onClick={handleSubmit}
          >
            {addMember.isPending ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProductionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const { data: production, isLoading, isError } = useProduction(id);
  const { data: dealMemos } = useDealMemos({ productionId: id });
  const removeMember = useRemoveMember();

  const handleRemoveMember = (userId, name) => {
    if (!confirm(`Remove ${name} from this production?`)) return;
    removeMember.mutate(
      { productionId: id, userId },
      {
        onSuccess: () => toast.success(`${name} removed from production`),
        onError: (err) =>
          toast.error(err?.response?.data?.message || "Failed to remove member"),
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (isError || !production) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-destructive">Failed to load production.</p>
            <Button variant="outline" onClick={() => navigate("/productions")}>
              Back to Productions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = production;
  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pre_production;
  const members = p.members || [];
  const existingMemberIds = members.map((m) =>
    typeof m.userId === "object" ? m.userId._id : m.userId
  );
  const productionDealMemos = dealMemos || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/productions")}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {p.name}
            </h1>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium border shrink-0", statusCfg.color)}
            >
              {statusCfg.label}
            </Badge>
          </div>
          {p.code && (
            <p className="text-sm text-muted-foreground font-mono mt-0.5">
              {p.code}
            </p>
          )}
        </div>
      </div>

      {/* Production Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-primary" />
            Production Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
            <InfoField
              icon={Film}
              label="Type"
              value={TYPE_LABELS[p.productionType] || p.productionType}
            />
            <InfoField icon={Globe} label="Country" value={p.country} />
            <InfoField
              icon={Banknote}
              label="Budget"
              value={formatCurrency(p.budget, p.country)}
            />
            <InfoField icon={Banknote} label="Currency" value={p.currency} />
            <InfoField
              icon={Calendar}
              label="Start Date"
              value={p.startDate ? format(parseISO(p.startDate), "dd MMM yyyy") : null}
            />
            <InfoField
              icon={Calendar}
              label="End Date"
              value={p.endDate ? format(parseISO(p.endDate), "dd MMM yyyy") : null}
            />
            <InfoField icon={Building2} label="Company" value={p.companyName} />
            <InfoField
              icon={Users}
              label="Members"
              value={`${members.length} member${members.length !== 1 ? "s" : ""}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Members ({members.length})
            </CardTitle>
            {isAdmin && (
              <AddMemberDialog
                productionId={id}
                existingMemberIds={existingMemberIds}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No members added to this production yet.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Production Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {isAdmin && <TableHead className="w-[80px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const u = member.userId;
                    const isPopulated = typeof u === "object" && u !== null;
                    const name = isPopulated
                      ? `${u.firstName} ${u.lastName}`
                      : "Unknown User";
                    const email = isPopulated ? u.email : "--";
                    const memberId = isPopulated ? u._id : u;

                    return (
                      <TableRow key={memberId}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {isPopulated ? `${u.firstName?.[0]}${u.lastName?.[0]}` : "?"}
                            </div>
                            <span className="font-medium text-sm">{name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.joinedAt
                            ? formatDate(member.joinedAt)
                            : "--"}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={removeMember.isPending}
                              onClick={() => handleRemoveMember(memberId, name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Memos Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Deal Memos ({productionDealMemos.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/deal-memos/new")}
            >
              New Deal Memo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productionDealMemos.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No deal memos for this production yet.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Number</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weekly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionDealMemos.map((dm) => (
                    <TableRow
                      key={dm._id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate(`/deal-memos/${dm._id}`)}
                    >
                      <TableCell className="font-medium text-sm">
                        {dm.dealNumber || "--"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {dm.personId?.firstName
                          ? `${dm.personId.firstName} ${dm.personId.lastName}`
                          : "--"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dm.departmentId?.name || dm.department || "--"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {dm.status?.replace(/_/g, " ") || "--"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(dm.weeklyRate, p.country)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timecards Section (count only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Timecards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-sm text-muted-foreground">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/timecards")}
            >
              View Timecards
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
