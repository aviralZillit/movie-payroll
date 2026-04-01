import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import useUiStore from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Film,
  FileText,
  Clock,
  Banknote,
  CreditCard,
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Users,
} from "lucide-react";

// Role hierarchy: who can see what
// super_admin, payroll_admin → everything
// production_accountant → dashboard, productions, deal memos, timecards, payroll, rate cards
// department_head → dashboard, productions, deal memos, timecards (approve), rate cards
// crew_member → dashboard, my deal memos, my timecards, rate cards

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null }, // all roles
  { to: "/productions", label: "Productions", icon: Film, roles: ["super_admin", "payroll_admin", "production_accountant", "department_head"] },
  { to: "/deal-memos", label: "Deal Memos", icon: FileText, roles: null },
  { to: "/timecards", label: "Timecards", icon: Clock, roles: null },
  { to: "/payroll", label: "Payroll", icon: Banknote, roles: ["super_admin", "payroll_admin", "production_accountant"] },
  { to: "/rate-cards", label: "Rate Cards", icon: CreditCard, roles: null },
  { to: "/admin/rate-cards", label: "Admin Rates", icon: ShieldCheck, roles: ["super_admin", "payroll_admin"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: null },
  { to: "/users", label: "Users", icon: Users, roles: ["super_admin", "payroll_admin"] },
];

function getVisibleNavItems(role) {
  return navItems.filter((item) => !item.roles || item.roles.includes(role));
}

function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const visibleItems = getVisibleNavItems(user?.role);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <span className="text-lg font-bold text-sidebar-foreground">
            Payroll
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="flex flex-col gap-1 p-2">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        {/* Role indicator */}
        {sidebarOpen && user?.role && (
          <div className="mx-2 mt-4 rounded-md bg-sidebar-accent/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Role</p>
            <p className="text-xs font-medium text-sidebar-foreground/70 capitalize">
              {user.role.replace(/_/g, " ")}
            </p>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}

function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-14 items-center justify-end gap-2 border-b bg-background/95 px-4 backdrop-blur transition-all duration-300",
        sidebarOpen ? "left-64" : "left-16",
        "right-0"
      )}
    >
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div role="button" tabIndex={0} className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:opacity-80">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default function MainLayout() {
  const token = useAuthStore((s) => s.token);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          "pt-14 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
