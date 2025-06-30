import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  AlertTriangle, 
  User, 
  Building, 
  Car, 
  Phone, 
  Share2,
  DollarSign, 
  Briefcase,
  ChevronDown,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart2,
  AtSign
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import logoRaizen from '../assets/logo-raizen.png';

const menuItems = [
  { path: '/criminal-board', icon: Share2, label: 'Quadro Criminal' },
  { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { path: '/occurrences', icon: AlertTriangle, label: 'Ocorrência' },
  { path: '/cpf', icon: User, label: 'CPF' },
  { path: '/cnpj', icon: Building, label: 'CNPJ' },
  { path: '/properties', icon: Home, label: 'Imóveis' },
  { path: '/vehicles', icon: Car, label: 'Veículos' },
  { path: '/phones', icon: Phone, label: 'Telefones' },
  { path: '/social-networks', icon: AtSign, label: 'Redes Sociais' },
  { path: '/financial', icon: DollarSign, label: 'Financeiro' },
  { path: '/corporate', icon: Briefcase, label: 'Empresarial' },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-neutral-900 shadow-lg transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
        style={{ backgroundColor: '#181a1b' }}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 px-4 bg-black ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center space-x-3">
            <img src={logoRaizen} alt="Logo Raízen" className="h-8 w-8 object-contain flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-white font-bold text-lg whitespace-nowrap">
                Mapa Inteligência
              </span>
            )}
          </div>
          
          {/* Toggle button for desktop */}
          <button
            className={`hidden lg:block text-white hover:bg-gray-800 p-1 rounded ${!sidebarExpanded && 'absolute left-full ml-2'}`}
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          
          {/* Close button for mobile */}
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-2 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-white hover:bg-gray-800 hover:text-white'
                  } ${!sidebarExpanded ? 'justify-center' : ''}`}
                  style={isActive ? { backgroundColor: '#23272a', color: '#fff' } : {}}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarExpanded && (
                    <span className="ml-3 whitespace-nowrap">{item.label}</span>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {!sidebarExpanded && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-black shadow-sm h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              className="lg:hidden text-white mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3 lg:hidden">
              <Shield className="h-6 w-6 text-white" />
              <span className="text-white font-medium">Mapa Inteligência</span>
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-black" />
              </div>
              <span className="hidden md:block">{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};