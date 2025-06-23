import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CPFModule } from './components/modules/CPFModule';
import { OccurrenceModule } from './components/modules/OccurrenceModule';
import { CNPJModule } from './components/modules/CNPJModule';
import { PropertiesModule } from './components/modules/PropertiesModule';
import { VehiclesModule } from './components/modules/VehiclesModule';
import { PhonesModule } from './components/modules/PhonesModule';
import { SocialNetworksModule } from './components/modules/SocialNetworksModule';
import { FinancialModule } from './components/modules/FinancialModule';
import { CorporateModule } from './components/modules/CorporateModule';
import CriminalBoardModule from './components/modules/CriminalBoardModule';

const PrivateRoutes: React.FC = () => {
  const { isAuthenticated, verifyToken } = useAuthStore();
  
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="occurrences" element={<OccurrenceModule />} />
            <Route path="cpf" element={<CPFModule />} />
            <Route path="cnpj" element={<CNPJModule />} />
            <Route path="properties" element={<PropertiesModule />} />
            <Route path="vehicles" element={<VehiclesModule />} />
            <Route path="phones" element={<PhonesModule />} />
            <Route path="social-networks" element={<SocialNetworksModule />} />
            <Route path="financial" element={<FinancialModule />} />
            <Route path="corporate" element={<CorporateModule />} />
            <Route path="criminal-board" element={<CriminalBoardModule />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;