import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Lock,
  Bell,
  Building2,
  Palette,
  Shield,
  Save,
  Eye,
  EyeOff,
  ClipboardList,
  Plus,
  RotateCcw,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/authStore";
import useUiStore from "@/store/uiStore";
import api from "@/lib/axios";

const ADMIN_ROLES = ["super_admin", "payroll_admin", "production_accountant"];

const CATEGORY_COLORS = {
  tax: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  id: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  bank: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  pension: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  compliance: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  personal: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
  custom: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

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
  production_accountant: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  department_head: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  crew_member: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailTimecardApproval: true,
    emailPayrollReady: true,
    emailDealMemoSigned: true,
    pushTimecardReminder: false,
  });

  // ── Onboarding config state (admin only) ──────────────────────────
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const [productions, setProductions] = useState([]);
  const [selectedProductionId, setSelectedProductionId] = useState("");
  const [onboardingReqs, setOnboardingReqs] = useState([]);
  const [onboardingCustomized, setOnboardingCustomized] = useState(false);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [newReqLabel, setNewReqLabel] = useState("");

  // Fetch productions list for admin
  useEffect(() => {
    if (!isAdmin) return;
    api.get("/productions").then(({ data }) => {
      setProductions(data.data || []);
    }).catch(() => {});
  }, [isAdmin]);

  // Fetch onboarding requirements when production selected
  const fetchOnboarding = useCallback(async (prodId) => {
    if (!prodId) return;
    setLoadingOnboarding(true);
    try {
      const { data } = await api.get(`/productions/${prodId}/settings/onboarding`);
      setOnboardingReqs(data.data.requirements || []);
      setOnboardingCustomized(data.data.isCustomized || false);
    } catch {
      toast.error("Failed to load onboarding requirements");
    } finally {
      setLoadingOnboarding(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProductionId) fetchOnboarding(selectedProductionId);
  }, [selectedProductionId, fetchOnboarding]);

  const handleSaveOnboarding = async () => {
    if (!selectedProductionId) return;
    setSavingOnboarding(true);
    try {
      await api.put(`/productions/${selectedProductionId}/settings/onboarding`, {
        requirements: onboardingReqs,
      });
      setOnboardingCustomized(true);
      toast.success("Onboarding requirements saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save requirements");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!selectedProductionId) return;
    setSavingOnboarding(true);
    try {
      await api.put(`/productions/${selectedProductionId}/settings/onboarding`, {
        requirements: [],
      });
      // Re-fetch to get defaults
      await fetchOnboarding(selectedProductionId);
      toast.success("Reset to country defaults");
    } catch {
      toast.error("Failed to reset requirements");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const toggleReqEnabled = (index) => {
    setOnboardingReqs((prev) =>
      prev.map((r, i) => (i === index ? { ...r, required: !r.required } : r))
    );
  };

  const removeReq = (index) => {
    setOnboardingReqs((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomReq = () => {
    const label = newReqLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    setOnboardingReqs((prev) => [
      ...prev,
      { key, label, category: "custom", required: true, isCustom: true },
    ]);
    setNewReqLabel("");
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/me/profile", profile);
      if (data.data) setUser(data.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/me/password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success("Password changed");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* ── Profile ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
            </div>
            <div>
              <p className="font-medium">
                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] ${ROLE_COLORS[user?.role] || ""}`}
              >
                {ROLE_LABELS[user?.role] || user?.role}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="opacity-60" />
              <p className="text-[11px] text-muted-foreground">
                Contact admin to change email
              </p>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="cursor-pointer"
            >
              {savingProfile ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Password ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showPasswords}
                onCheckedChange={setShowPasswords}
              />
              <span className="text-xs text-muted-foreground">
                Show passwords
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm
              }
              variant="outline"
              className="cursor-pointer"
            >
              {savingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Appearance ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Palette className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Notifications ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you get notified about
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "emailTimecardApproval",
              label: "Timecard Approvals",
              desc: "Get notified when your timecard is approved or rejected",
            },
            {
              key: "emailPayrollReady",
              label: "Payroll Ready",
              desc: "Get notified when payroll is processed",
            },
            {
              key: "emailDealMemoSigned",
              label: "Deal Memo Signed",
              desc: "Get notified when a deal memo is signed",
            },
            {
              key: "pushTimecardReminder",
              label: "Timecard Reminders",
              desc: "Weekly reminder to submit your timecard",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, [item.key]: checked })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Account Info ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Account details and access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <Badge
              variant="outline"
              className={ROLE_COLORS[user?.role] || ""}
            >
              {ROLE_LABELS[user?.role] || user?.role}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-mono text-xs">{user?.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Account Status</span>
            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
              Active
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member Since</span>
            <span className="text-xs">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Production Onboarding Requirements (admin only) ─────── */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <ClipboardList className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Production Onboarding Requirements</CardTitle>
                <CardDescription>
                  Configure which fields crew must complete before payroll
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Production selector */}
            <div className="space-y-2">
              <Label>Production</Label>
              <Select
                value={selectedProductionId}
                onValueChange={setSelectedProductionId}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select a production" />
                </SelectTrigger>
                <SelectContent>
                  {productions.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} ({p.country || "UK"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductionId && loadingOnboarding && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading requirements...
              </div>
            )}

            {selectedProductionId && !loadingOnboarding && (
              <>
                {onboardingCustomized && (
                  <Badge variant="outline" className="bg-orange-500/15 text-orange-600 border-orange-500/30">
                    Customized
                  </Badge>
                )}
                {!onboardingCustomized && (
                  <Badge variant="outline" className="bg-zinc-500/15 text-zinc-500 border-zinc-500/30">
                    Using country defaults
                  </Badge>
                )}

                <Separator />

                {/* Requirements list */}
                <div className="space-y-2">
                  {onboardingReqs.map((req, idx) => (
                    <div
                      key={req.key + idx}
                      className="flex items-center gap-3 rounded-md border px-3 py-2"
                    >
                      <Checkbox
                        checked={req.required}
                        onCheckedChange={() => toggleReqEnabled(idx)}
                      />
                      <span className="flex-1 text-sm">{req.label}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${CATEGORY_COLORS[req.category] || CATEGORY_COLORS.custom}`}
                      >
                        {req.category}
                      </Badge>
                      {req.required ? (
                        <span className="text-[10px] font-medium text-red-500">Required</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Optional</span>
                      )}
                      {req.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeReq(idx)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add custom requirement */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newReqLabel}
                    onChange={(e) => setNewReqLabel(e.target.value)}
                    placeholder="Custom requirement label"
                    className="max-w-xs"
                    onKeyDown={(e) => e.key === "Enter" && addCustomReq()}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomReq}
                    disabled={!newReqLabel.trim()}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                    disabled={savingOnboarding}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset to Defaults
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveOnboarding}
                    disabled={savingOnboarding}
                  >
                    {savingOnboarding ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Requirements
                      </span>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {/* ── Bureau Contacts (admin only) ──────────────────────── */}
      {ADMIN_ROLES.includes(user?.role) && (
        <BureauContactsSection />
      )}
    </motion.div>
  );
}

// ── Bureau Contacts Component ─────────────────────────────────────────
function BureauContactsSection() {
  const [selectedProdId, setSelectedProdId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productions, setProductions] = useState([]);
  const [newContact, setNewContact] = useState({ contactName: "", email: "", phone: "", departments: "" });

  useEffect(() => {
    api.get("/productions").then(({ data }) => setProductions(data.data || data.productions || [])).catch(() => {});
  }, []);

  const fetchContacts = async (prodId) => {
    if (!prodId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/productions/${prodId}/settings`);
      const settings = data.data || data;
      setContacts(settings.bureauContacts || []);
    } catch {
      setContacts([]);
    }
    setLoading(false);
  };

  const handleSelectProd = (val) => {
    setSelectedProdId(val);
    fetchContacts(val);
  };

  const handleAddContact = () => {
    if (!newContact.contactName.trim()) return;
    const depts = newContact.departments.split(",").map(d => d.trim()).filter(Boolean);
    setContacts(prev => [...prev, { ...newContact, departments: depts }]);
    setNewContact({ contactName: "", email: "", phone: "", departments: "" });
  };

  const handleRemoveContact = (idx) => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedProdId) return;
    setSaving(true);
    try {
      await api.put(`/productions/${selectedProdId}/settings`, { bureauContacts: contacts });
      toast.success("Bureau contacts saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building2 className="size-5 text-primary" />
          <div>
            <CardTitle>Bureau Contacts</CardTitle>
            <CardDescription>Assign which person at the payroll bureau manages which departments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Production</Label>
          <Select value={selectedProdId} onValueChange={handleSelectProd}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a production" />
            </SelectTrigger>
            <SelectContent>
              {productions.map(p => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProdId && !loading && (
          <>
            {contacts.length > 0 ? (
              <div className="rounded-md border overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 px-3 font-medium">Contact Name</th>
                      <th className="text-left py-2 px-3 font-medium">Email</th>
                      <th className="text-left py-2 px-3 font-medium">Phone</th>
                      <th className="text-left py-2 px-3 font-medium">Departments</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{c.contactName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{c.email || "—"}</td>
                        <td className="py-2 px-3 text-muted-foreground">{c.phone || "—"}</td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.departments || []).map((d, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{d}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveContact(idx)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No bureau contacts configured yet.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-4 border-t pt-3">
              <Input placeholder="Contact name" value={newContact.contactName} onChange={e => setNewContact(p => ({ ...p, contactName: e.target.value }))} className="h-8 text-sm" />
              <Input placeholder="Email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} className="h-8 text-sm" />
              <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} className="h-8 text-sm" />
              <Input placeholder="Depts (comma-separated)" value={newContact.departments} onChange={e => setNewContact(p => ({ ...p, departments: e.target.value }))} className="h-8 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddContact} disabled={!newContact.contactName.trim()}>
                <Plus className="size-3 mr-1" /> Add Contact
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Save className="size-3 mr-1" />}
                Save Contacts
              </Button>
            </div>
          </>
        )}
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      </CardContent>
    </Card>
  );
}
