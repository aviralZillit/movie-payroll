import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Film,
  Shield,
  Users,
  Clapperboard,
  LogIn,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  {
    category: "Admin & Management",
    icon: Shield,
    color: "text-red-400",
    accounts: [
      { email: "admin@prodpayroll.com", name: "James Richardson", role: "Super Admin", badge: "Full Access", badgeColor: "bg-red-500/20 text-red-400 border-red-500/30" },
      { email: "sarah@prodpayroll.com", name: "Sarah Mitchell", role: "Payroll Admin", badge: "Payroll", badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
      { email: "david@prodpayroll.com", name: "David Chen", role: "Prod. Accountant", badge: "Finance", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    ],
  },
  {
    category: "Department Heads",
    icon: Users,
    color: "text-blue-400",
    accounts: [
      { email: "emma@prodpayroll.com", name: "Emma Thompson", role: "HOD Camera", badge: "Camera", badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
      { email: "michael@prodpayroll.com", name: "Michael Brooks", role: "HOD Sound", badge: "Sound", badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
      { email: "rachel@prodpayroll.com", name: "Rachel Kumar", role: "HOD Art", badge: "Art", badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
    ],
  },
  {
    category: "Crew",
    icon: Clapperboard,
    color: "text-emerald-400",
    accounts: [
      { email: "tom@prodpayroll.com", name: "Tom Harris", role: "DOP", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "lisa@prodpayroll.com", name: "Lisa Patel", role: "1st AC", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "jake@prodpayroll.com", name: "Jake Morrison", role: "Gaffer", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "kate@prodpayroll.com", name: "Kate Ashford", role: "Lead Actor", badge: "Equity", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      { email: "sam@prodpayroll.com", name: "Sam O'Brien", role: "Spark", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "ben@prodpayroll.com", name: "Ben Fletcher", role: "Editor", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "nina@prodpayroll.com", name: "Nina Costa", role: "Boom Op", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
      { email: "zara@prodpayroll.com", name: "Zara Phillips", role: "Runner", badge: "BECTU", badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
    ],
  },
];

const DEMO_PASSWORD = "Demo123!";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: resp } = await api.post("/auth/login", { email, password });
      login({ user: resp.data.user, token: resp.data.accessToken, refreshToken: resp.data.refreshToken });
      toast.success(`Welcome back!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setLoadingAccount(account.email);
    try {
      const { data: resp } = await api.post("/auth/login", {
        email: account.email,
        password: DEMO_PASSWORD,
      });
      login({ user: resp.data.user, token: resp.data.accessToken, refreshToken: resp.data.refreshToken });
      toast.success(`Logged in as ${account.name} (${account.role})`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Demo login failed. Run the seed script first.");
    } finally {
      setLoadingAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] overflow-auto">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#030712] to-[#030712] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* ── Header / Branding ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Film className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Production Payroll
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            UK Film & TV Payroll Management
          </p>
        </motion.div>

        {/* ── Main Grid: Login + Demo Accounts ──────────────── */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr] items-start">
          {/* ── Login Card (always visible, prominent) ──────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@production.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-white text-black font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </span>
                    )}
                  </Button>
                </form>

                {/* Quick password hint */}
                <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-center">
                  <span className="text-xs text-amber-400/80">
                    Demo password:{" "}
                    <code className="font-mono font-bold text-amber-300">
                      Demo123!
                    </code>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="mt-4 text-center text-[11px] text-zinc-600">
              Powered by BECTU, Equity, FAA, Directors UK, WGGB & MU rate
              agreements
            </p>
          </motion.div>

          {/* ── Demo Accounts Panel ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <CardTitle className="text-lg text-white">
                      Quick Demo Access
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 text-[10px]"
                  >
                    15 accounts
                  </Badge>
                </div>
                <CardDescription>
                  Click any account below to instantly sign in with pre-seeded
                  data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {DEMO_ACCOUNTS.map((group) => (
                  <div key={group.category}>
                    {/* Group header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <group.icon
                        className={`h-3.5 w-3.5 ${group.color}`}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                        {group.category}
                      </span>
                    </div>

                    {/* Account grid */}
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                      {group.accounts.map((account) => (
                        <button
                          key={account.email}
                          onClick={() => handleDemoLogin(account)}
                          disabled={!!loadingAccount}
                          className={`
                            group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left
                            transition-all duration-200 cursor-pointer
                            border-white/5 hover:border-white/15 hover:bg-white/[0.04]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${loadingAccount === account.email ? "border-white/20 bg-white/[0.06]" : ""}
                          `}
                        >
                          {/* Avatar */}
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-zinc-300">
                            {account.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                {account.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-zinc-500 truncate">
                                {account.role}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-medium leading-4 ${account.badgeColor}`}
                              >
                                {account.badge}
                              </span>
                            </div>
                          </div>
                          {/* Loading indicator */}
                          {loadingAccount === account.email && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {group.category !== "Crew" && (
                      <Separator className="mt-4 bg-white/5" />
                    )}
                  </div>
                ))}

                {/* Pre-loaded data summary */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                  {[
                    "3 Productions",
                    "9 Deal Memos",
                    "6 Timecards",
                    "2 Payroll Runs",
                    "62 Rate Cards",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-500 ring-1 ring-inset ring-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
