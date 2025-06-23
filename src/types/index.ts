export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'investigator' | 'analyst';
}

export interface Occurrence {
  id: string;
  type: string;
  communicationType: string;
  involved: string[];
  unit: string;
  latitude: number;
  longitude: number;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  startDate: string;
  endDate?: string;
  responsible: string;
  status: 'Em andamento' | 'Finalizada';
  observations: string;
  finalConsiderations?: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CPF {
  id: string;
  cpf: string;
  name: string;
  type: string;
  criminalRecord: string;
  criminalTypology: string[];
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  photo?: string;
  documents: FileAttachment[];
  connections: Connection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CNPJ {
  id: string;
  cnpj: string;
  companyName: string;
  typology: string;
  latitude: number;
  longitude: number;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  description: string;
  linkType: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  description: string;
  linkType: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Phone {
  id: string;
  number: string;
  linkType: string;
  owner: string;
  ownerCpf?: string;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialNetwork {
  id: string;
  platform: string;
  link: string;
  profileName: string;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Financial {
  id: string;
  ownerCpf: string;
  ownerName: string;
  transactionType: string;
  bankData: string;
  amount: number;
  fromName: string;
  fromCpf?: string;
  toName: string;
  toCpf?: string;
  primaryLinkCpf?: string;
  primaryLinkName?: string;
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Corporate {
  id: string;
  involvedCpf: string;
  involvedName: string;
  raizenLink: string;
  sector: string;
  startDate: string;
  endDate?: string;
  active: 'SIM' | 'NÃO' | 'N/A';
  leftDueToOccurrence: 'SIM' | 'NÃO' | 'N/A';
  notes: string;
  documents: FileAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Connection {
  id: string;
  fromCpf: string;
  toCpf: string;
  relationship: string;
  strength: 'weak' | 'medium' | 'strong';
  notes?: string;
}

export interface CriminalBoardPosition {
  cpf: string;
  x: number;
  y: number;
}

export interface DashboardStats {
  totalOccurrences: number;
  activeCases: number;
  totalCpfs: number;
  totalConnections: number;
  occurrencesByType: { type: string; count: number }[];
  occurrencesBySeverity: { severity: string; count: number }[];
  occurrencesByUnit: { unit: string; count: number }[];
  occurrencesByResponsible: { responsible: string; count: number }[];
}