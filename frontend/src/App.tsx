import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Anomalies from "./pages/Anomalies";
import RepositoryScanner from "./pages/RepositoryScanner";
import WorkspaceTree from "./pages/WorkspaceTree";
import SplitPaneInspector from "./pages/SplitPaneInspector";
import ShadowGraph from "./pages/ShadowGraph";
import ExposureSimulator from "./pages/ExposureSimulator";
import JitPolicies from "./pages/JitPolicies";
import ScopeDecay from "./pages/ScopeDecay";
import PullRequests from "./pages/PullRequests";
import FrictionAnalytics from "./pages/FrictionAnalytics";
import ScopeLedger from "./pages/ScopeLedger";
import TimeForensics from "./pages/TimeForensics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/scanner" element={<RepositoryScanner />} />
            <Route path="/workspace" element={<WorkspaceTree />} />
            <Route path="/inspector" element={<SplitPaneInspector />} />
            <Route path="/graph" element={<ShadowGraph />} />
            <Route path="/simulator" element={<ExposureSimulator />} />
            <Route path="/policies" element={<JitPolicies />} />
            <Route path="/decay" element={<ScopeDecay />} />
            <Route path="/pull-requests" element={<PullRequests />} />
            <Route path="/friction" element={<FrictionAnalytics />} />
            <Route path="/ledger" element={<ScopeLedger />} />
            <Route path="/forensics" element={<TimeForensics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
