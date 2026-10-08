import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './components/layout/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TopologyPage } from './pages/TopologyPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { AuditPage } from './pages/AuditPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ArchitectPage } from './pages/ArchitectPage';

import { DocsPage } from './pages/DocsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<RootLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/architect" element={<ArchitectPage />} />
            <Route path="/topology" element={<TopologyPage />} />
            <Route path="/recovery" element={<RecoveryPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/mcp" element={<DocsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
