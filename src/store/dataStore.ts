import { create } from 'zustand';
import { 
  Occurrence, 
  CPF, 
  CNPJ, 
  Property, 
  Vehicle, 
  Phone, 
  SocialNetwork, 
  Financial, 
  Corporate,
  DashboardStats,
  CriminalBoardPosition
} from '../types';
import { useAuthStore } from './authStore';

interface DataState {
  // Data
  occurrences: Occurrence[];
  cpfs: CPF[];
  cnpjs: CNPJ[];
  properties: Property[];
  vehicles: Vehicle[];
  phones: Phone[];
  socialNetworks: SocialNetwork[];
  financials: Financial[];
  corporates: Corporate[];
  
  // Criminal Board
  boardPositions: CriminalBoardPosition[];
  
  // Loading states
  loading: {
    occurrences: boolean;
    cpfs: boolean;
    cnpjs: boolean;
    properties: boolean;
    vehicles: boolean;
    phones: boolean;
    socialNetworks: boolean;
    financials: boolean;
    corporates: boolean;
  };
  
  // Actions
  fetchOccurrences: () => Promise<void>;
  addOccurrence: (occurrence: Omit<Occurrence, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateOccurrence: (id: string, occurrence: Partial<Occurrence>) => Promise<void>;
  deleteOccurrence: (id: string) => Promise<void>;
  
  fetchCpfs: () => Promise<void>;
  addCpf: (cpf: Omit<CPF, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateCpf: (id: string, cpf: Partial<CPF>) => Promise<void>;
  deleteCpf: (id: string) => Promise<void>;
  
  fetchCnpjs: () => Promise<void>;
  addCnpj: (cnpj: Omit<CNPJ, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateCnpj: (id: string, cnpj: Partial<CNPJ>) => Promise<void>;
  deleteCnpj: (id: string) => Promise<void>;
  
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  fetchPhones: () => Promise<void>;
  addPhone: (phone: Omit<Phone, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updatePhone: (id: string, phone: Partial<Phone>) => Promise<void>;
  deletePhone: (id: string) => Promise<void>;
  
  fetchSocialNetworks: () => Promise<void>;
  addSocialNetwork: (socialNetwork: Omit<SocialNetwork, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateSocialNetwork: (id: string, socialNetwork: Partial<SocialNetwork>) => Promise<void>;
  deleteSocialNetwork: (id: string) => Promise<void>;
  
  fetchFinancials: () => Promise<void>;
  addFinancial: (financial: Omit<Financial, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateFinancial: (id: string, financial: Partial<Financial>) => Promise<void>;
  deleteFinancial: (id: string) => Promise<void>;
  
  fetchCorporates: () => Promise<void>;
  addCorporate: (corporate: Omit<Corporate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateCorporate: (id: string, corporate: Partial<Corporate>) => Promise<void>;
  deleteCorporate: (id: string) => Promise<void>;
  
  // Board position management
  updateBoardPosition: (cpf: string, x: number, y: number) => void;
  resetBoardPositions: () => void;
  
  // Dashboard stats
  getDashboardStats: () => DashboardStats;

  // Bulk actions
  fetchAllData: () => Promise<void>;
  clearAllData: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useDataStore = create<DataState>((set, get) => ({
  // Estado inicial
  occurrences: [],
  cpfs: [],
  cnpjs: [],
  properties: [],
  vehicles: [],
  phones: [],
  socialNetworks: [],
  financials: [],
  corporates: [],
  boardPositions: [],
  
  loading: {
    occurrences: false,
    cpfs: false,
    cnpjs: false,
    properties: false,
    vehicles: false,
    phones: false,
    socialNetworks: false,
    financials: false,
    corporates: false,
  },

  // Occurrences
  fetchOccurrences: async () => {
    set(state => ({ loading: { ...state.loading, occurrences: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/occurrences`);
      const data = await response.json();
      set({ occurrences: data });
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, occurrences: false } }));
    }
  },

  addOccurrence: async (occurrenceData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...occurrenceData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/occurrences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchOccurrences();
      } else {
        console.error('Falha ao adicionar ocorrência:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar ocorrência:', error);
    }
  },

  updateOccurrence: async (id, occurrenceData) => {
    try {
      await fetch(`${API_BASE_URL}/occurrences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(occurrenceData),
      });
      set(state => ({
        occurrences: state.occurrences.map(occurrence => occurrence.id === id ? { ...occurrence, ...occurrenceData } : occurrence)
      }));
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
    }
  },

  deleteOccurrence: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/occurrences/${id}`, { method: 'DELETE' });
      set(state => ({ occurrences: state.occurrences.filter(occurrence => occurrence.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar ocorrência:', error);
    }
  },

  // CPFs
  fetchCpfs: async () => {
    set(state => ({ loading: { ...state.loading, cpfs: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/cpfs`);
      const data = await response.json();
      set({ cpfs: data });
    } catch (error) {
      console.error('Erro ao buscar CPFs:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, cpfs: false } }));
    }
  },

  addCpf: async (cpfData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...cpfData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/cpfs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchCpfs();
      } else {
        console.error('Falha ao adicionar CPF:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar CPF:', error);
    }
  },

  updateCpf: async (id, cpfData) => {
    try {
      await fetch(`${API_BASE_URL}/cpfs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cpfData),
      });
      set(state => ({
        cpfs: state.cpfs.map(cpf => cpf.id === id ? { ...cpf, ...cpfData } : cpf)
      }));
    } catch (error) {
      console.error('Erro ao atualizar CPF:', error);
    }
  },

  deleteCpf: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/cpfs/${id}`, { method: 'DELETE' });
      set(state => ({ cpfs: state.cpfs.filter(cpf => cpf.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar CPF:', error);
    }
  },

  // CNPJs
  fetchCnpjs: async () => {
    set(state => ({ loading: { ...state.loading, cnpjs: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/cnpjs`);
      const data = await response.json();
      set({ cnpjs: data });
    } catch (error) {
      console.error('Erro ao buscar CNPJs:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, cnpjs: false } }));
    }
  },

  addCnpj: async (cnpjData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...cnpjData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/cnpjs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchCnpjs();
      } else {
        console.error('Falha ao adicionar CNPJ:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar CNPJ:', error);
    }
  },

  updateCnpj: async (id, cnpjData) => {
    try {
      await fetch(`${API_BASE_URL}/cnpjs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cnpjData),
      });
      set(state => ({
        cnpjs: state.cnpjs.map(cnpj => cnpj.id === id ? { ...cnpj, ...cnpjData } : cnpj)
      }));
    } catch (error) {
      console.error('Erro ao atualizar CNPJ:', error);
    }
  },

  deleteCnpj: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/cnpjs/${id}`, { method: 'DELETE' });
      set(state => ({ cnpjs: state.cnpjs.filter(cnpj => cnpj.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar CNPJ:', error);
    }
  },

  // Properties
  fetchProperties: async () => {
    set(state => ({ loading: { ...state.loading, properties: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/properties`);
      const data = await response.json();
      set({ properties: data });
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, properties: false } }));
    }
  },

  addProperty: async (propertyData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...propertyData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchProperties();
      } else {
        console.error('Falha ao adicionar Propriedade:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar propriedade:', error);
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });
      set(state => ({
        properties: state.properties.map(property => property.id === id ? { ...property, ...propertyData } : property)
      }));
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error);
    }
  },

  deleteProperty: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/properties/${id}`, { method: 'DELETE' });
      set(state => ({ properties: state.properties.filter(property => property.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar propriedade:', error);
    }
  },

  // Vehicles
  fetchVehicles: async () => {
    set(state => ({ loading: { ...state.loading, vehicles: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await response.json();
      set({ vehicles: data });
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, vehicles: false } }));
    }
  },

  addVehicle: async (vehicleData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...vehicleData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchVehicles();
      } else {
        console.error('Falha ao adicionar Veículo:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      set(state => ({
        vehicles: state.vehicles.map(vehicle => vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle)
      }));
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
    }
  },

  deleteVehicle: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/vehicles/${id}`, { method: 'DELETE' });
      set(state => ({ vehicles: state.vehicles.filter(vehicle => vehicle.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
    }
  },

  // Phones
  fetchPhones: async () => {
    set(state => ({ loading: { ...state.loading, phones: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/phones`);
      const data = await response.json();
      set({ phones: data });
    } catch (error) {
      console.error('Erro ao buscar telefones:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, phones: false } }));
    }
  },

  addPhone: async (phoneData) => {
    console.log('dataStore: Iniciando addPhone com dados:', phoneData);
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...phoneData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      console.log('dataStore: Dados com usuário:', dataWithUser);
      
      const response = await fetch(`${API_BASE_URL}/phones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      
      console.log('dataStore: Resposta do POST:', response.status);
      if (response.ok) {
        console.log('dataStore: Telefone criado, buscando lista atualizada...');
        get().fetchPhones();
      } else {
        console.error('Falha ao adicionar Telefone:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar telefone:', error);
    }
  },

  updatePhone: async (id, phoneData) => {
    try {
      await fetch(`${API_BASE_URL}/phones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneData),
      });
      set(state => ({
        phones: state.phones.map(phone => phone.id === id ? { ...phone, ...phoneData } : phone)
      }));
    } catch (error) {
      console.error('Erro ao atualizar telefone:', error);
    }
  },

  deletePhone: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/phones/${id}`, { method: 'DELETE' });
      set(state => ({ phones: state.phones.filter(phone => phone.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar telefone:', error);
    }
  },

  // Social Networks
  fetchSocialNetworks: async () => {
    set(state => ({ loading: { ...state.loading, socialNetworks: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/social-networks`);
      const data = await response.json();
      set({ socialNetworks: data });
    } catch (error) {
      console.error('Erro ao buscar redes sociais:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, socialNetworks: false } }));
    }
  },

  addSocialNetwork: async (socialNetworkData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...socialNetworkData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/social-networks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchSocialNetworks();
      } else {
        console.error('Falha ao adicionar Rede Social:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar rede social:', error);
    }
  },

  updateSocialNetwork: async (id, socialNetworkData) => {
    try {
      await fetch(`${API_BASE_URL}/social-networks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialNetworkData),
      });
      set(state => ({
        socialNetworks: state.socialNetworks.map(social => social.id === id ? { ...social, ...socialNetworkData } : social)
      }));
    } catch (error) {
      console.error('Erro ao atualizar rede social:', error);
    }
  },

  deleteSocialNetwork: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/social-networks/${id}`, { method: 'DELETE' });
      set(state => ({ socialNetworks: state.socialNetworks.filter(social => social.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar rede social:', error);
    }
  },

  // Financials
  fetchFinancials: async () => {
    set(state => ({ loading: { ...state.loading, financials: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/financials`);
      const data = await response.json();
      set({ financials: data });
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, financials: false } }));
    }
  },

  addFinancial: async (financialData) => {
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...financialData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      const response = await fetch(`${API_BASE_URL}/financials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      if (response.ok) {
        get().fetchFinancials();
      } else {
        console.error('Falha ao adicionar Transação Financeira:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar transação financeira:', error);
    }
  },

  updateFinancial: async (id, financialData) => {
    try {
      await fetch(`${API_BASE_URL}/financials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData),
      });
      set(state => ({
        financials: state.financials.map(financial => financial.id === id ? { ...financial, ...financialData } : financial)
      }));
    } catch (error) {
      console.error('Erro ao atualizar transação financeira:', error);
    }
  },

  deleteFinancial: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/financials/${id}`, { method: 'DELETE' });
      set(state => ({ financials: state.financials.filter(financial => financial.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar transação financeira:', error);
    }
  },

  // Corporates
  fetchCorporates: async () => {
    set(state => ({ loading: { ...state.loading, corporates: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/corporates`);
      const data = await response.json();
      set({ corporates: data });
    } catch (error) {
      console.error('Erro ao buscar dados empresariais:', error);
    } finally {
      set(state => ({ loading: { ...state.loading, corporates: false } }));
    }
  },

  addCorporate: async (corporateData) => {
    console.log('dataStore: Iniciando addCorporate com dados:', corporateData);
    try {
      const user = useAuthStore.getState().user;
      const dataWithUser = {
        ...corporateData,
        createdBy: user?.name || 'Usuário Desconhecido'
      };
      
      console.log('dataStore: Dados com usuário:', dataWithUser);
      
      const response = await fetch(`${API_BASE_URL}/corporates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithUser),
      });
      
      console.log('dataStore: Resposta do POST:', response.status);
      if (response.ok) {
        console.log('dataStore: Vínculo empresarial criado, buscando lista atualizada...');
        get().fetchCorporates();
      } else {
        console.error('Falha ao adicionar Vínculo Empresarial:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar vínculo empresarial:', error);
    }
  },

  updateCorporate: async (id, corporateData) => {
    try {
      await fetch(`${API_BASE_URL}/corporates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corporateData),
      });
      set(state => ({
        corporates: state.corporates.map(corporate => corporate.id === id ? { ...corporate, ...corporateData } : corporate)
      }));
    } catch (error) {
      console.error('Erro ao atualizar vínculo empresarial:', error);
    }
  },

  deleteCorporate: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/corporates/${id}`, { method: 'DELETE' });
      set(state => ({ corporates: state.corporates.filter(corporate => corporate.id !== id) }));
    } catch (error) {
      console.error('Erro ao deletar corporate:', error);
    }
  },

  // Board position management
  updateBoardPosition: (cpf, x, y) => {
    set(state => ({
      boardPositions: { ...state.boardPositions, [cpf]: { x, y } },
    }));
  },

  resetBoardPositions: () => set({ boardPositions: [] }),

  // Dashboard stats
  getDashboardStats: () => {
    const { occurrences, cpfs, cnpjs, properties, vehicles, phones } = get();

    if (!occurrences || occurrences.length === 0) {
      return {
        totalOccurrences: 0,
        activeCases: 0,
        totalCpfs: 0,
        totalConnections: 0,
        occurrencesByType: [],
        occurrencesBySeverity: [],
        occurrencesByUnit: [],
        occurrencesByResponsible: [],
      };
    }

    const occurrencesByType = occurrences.reduce((acc, o) => {
      const type = o.type || 'Não especificado';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const occurrencesBySeverity = occurrences.reduce((acc, o) => {
      const severity = o.severity || 'Não especificado';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const occurrencesByUnit = occurrences.reduce((acc, o) => {
      const unit = o.unit || 'Não especificado';
      acc[unit] = (acc[unit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const occurrencesByResponsible = occurrences.reduce((acc, o) => {
      const responsible = o.responsible || 'Não especificado';
      acc[responsible] = (acc[responsible] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);


    return {
      totalOccurrences: occurrences.length,
      activeCases: occurrences.filter(o => o.status === 'Em andamento').length,
      totalCpfs: cpfs.length,
      totalConnections: cpfs.filter(c => (c as any).primaryLinkCpf).length, // Exemplo
      occurrencesByType: Object.entries(occurrencesByType).map(([type, count]) => ({ type, count })),
      occurrencesBySeverity: Object.entries(occurrencesBySeverity).map(([severity, count]) => ({ severity, count })),
      occurrencesByUnit: Object.entries(occurrencesByUnit).map(([unit, count]) => ({ unit, count })),
      occurrencesByResponsible: Object.entries(occurrencesByResponsible).map(([responsible, count]) => ({ responsible, count })),
    };
  },

  // Ações em massa
  fetchAllData: async () => {
    console.log("Buscando todos os dados...");
    set(state => ({
      loading: {
        occurrences: true, cpfs: true, cnpjs: true, properties: true,
        vehicles: true, phones: true, socialNetworks: true, financials: true, corporates: true
      }
    }));

    try {
      const [
        occurrences, cpfs, cnpjs, properties, vehicles,
        phones, socialNetworks, financials, corporates
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/occurrences`).then(res => res.json()),
        fetch(`${API_BASE_URL}/cpfs`).then(res => res.json()),
        fetch(`${API_BASE_URL}/cnpjs`).then(res => res.json()),
        fetch(`${API_BASE_URL}/properties`).then(res => res.json()),
        fetch(`${API_BASE_URL}/vehicles`).then(res => res.json()),
        fetch(`${API_BASE_URL}/phones`).then(res => res.json()),
        fetch(`${API_BASE_URL}/social-networks`).then(res => res.json()),
        fetch(`${API_BASE_URL}/financials`).then(res => res.json()),
        fetch(`${API_BASE_URL}/corporates`).then(res => res.json()),
      ]);

      set({
        occurrences, cpfs, cnpjs, properties, vehicles,
        phones, socialNetworks, financials, corporates,
        loading: {
            occurrences: false, cpfs: false, cnpjs: false, properties: false,
            vehicles: false, phones: false, socialNetworks: false, financials: false, corporates: false
        }
      });
      console.log("Todos os dados foram buscados e atualizados no store.");

    } catch (error) {
      console.error("Erro ao buscar todos os dados:", error);
      set(state => ({
        loading: {
          occurrences: false, cpfs: false, cnpjs: false, properties: false,
          vehicles: false, phones: false, socialNetworks: false, financials: false, corporates: false
        }
      }));
    }
  },

  clearAllData: () => {
    console.log("Limpando todos os dados do store...");
    set({
      occurrences: [],
      cpfs: [],
      cnpjs: [],
      properties: [],
      vehicles: [],
      phones: [],
      socialNetworks: [],
      financials: [],
      corporates: [],
    });
    console.log("Store limpo.");
  },
})); 