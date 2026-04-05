import { useState } from "react";
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
import useAuthStore from "@/store/authStore";
import useUiStore from "@/store/uiStore";
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
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
