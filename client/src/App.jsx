import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import useUiStore from "@/store/uiStore";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Productions from "@/pages/Productions";
import ProductionDetail from "@/pages/ProductionDetail";
import DealMemos from "@/pages/DealMemos";
import DealMemoNew from "@/pages/DealMemoNew";
import DealMemoDetail from "@/pages/DealMemoDetail";
import Timecards from "@/pages/Timecards";
import TimecardDetail from "@/pages/TimecardDetail";
import Payroll from "@/pages/Payroll";
import PayrollDetail from "@/pages/PayrollDetail";
import RateCards from "@/pages/RateCards";
import Settings from "@/pages/Settings";
import AdminRateCards from "@/pages/AdminRateCards";
import UserManagement from "@/pages/UserManagement";
import RatesBible from "@/pages/RatesBible";
import CrewPortal from "@/pages/CrewPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInitializer({ children }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ThemeInitializer>
            <Routes>
              {/* Public / Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/productions" element={<Productions />} />
                <Route path="/productions/:id" element={<ProductionDetail />} />
                <Route path="/deal-memos" element={<DealMemos />} />
                <Route path="/deal-memos/new" element={<DealMemoNew />} />
                <Route path="/deal-memos/:id" element={<DealMemoDetail />} />
                <Route path="/timecards" element={<Timecards />} />
                <Route path="/timecards/:id" element={<TimecardDetail />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/payroll/:id" element={<PayrollDetail />} />
                <Route path="/rate-cards" element={<RateCards />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/rate-cards" element={<AdminRateCards />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/rates-bible" element={<RatesBible />} />
                <Route path="/crew-portal" element={<CrewPortal />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ThemeInitializer>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
