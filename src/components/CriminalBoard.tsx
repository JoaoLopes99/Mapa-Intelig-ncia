import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDataStore } from '../store/dataStore';
import { CPF, CNPJ, Property, Vehicle, Phone, SocialNetwork, Financial, Corporate } from '../types';

interface Node {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  color: string;
  primaryLinkCpf?: string;
}

// Componente para ícones genéricos baseados no tipo
const GenericIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 24 }) => {
  const getIcon = () => {
    switch (type) {
      case 'CPF':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        );
      case 'CNPJ':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
          </svg>
        );
      case 'IMÓVEL':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        );
      case 'VEÍCULO':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        );
      case 'TELEFONE':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        );
      case 'REDE SOCIAL':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
      case 'FINANCEIRO':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        );
      case 'EMPRESARIAL':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  return getIcon();
};

// Componente para ícone de lápis (edição)
const EditIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

// Definição da Interface do Modal
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: EditableData) => void;
  node: EditableData | null;
  allCpfs: CPF[];
}

// Componente do Modal de Edição
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, node, allCpfs }) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Quando o nó a ser editado muda, atualiza o estado do formulário
    if (node) {
      setFormData(node);
    }
  }, [node]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => {
      const newValues = { ...prev };
      let newValue: any = value;
      
      if (type === 'number') {
        newValue = parseFloat(value) || 0;
      } else if (type === 'date') {
        newValue = value;
      } else if (name === 'criminalTypology') {
        // Para arrays, converte string separada por vírgula em array
        newValue = value ? value.split(',').map((item: string) => item.trim()) : [];
      }
      
      newValues[name] = newValue;

      // Se o CPF vinculado é alterado, atualiza o nome vinculado automaticamente
      if (name === 'primaryLinkCpf') {
        const selectedCpfData = allCpfs.find(cpf => cpf.cpf === value);
        newValues['primaryLinkName'] = selectedCpfData ? selectedCpfData.name : '';
      }
      
      // O mesmo para o CPF envolvido no cadastro Corporativo
      if (name === 'involvedCpf') {
        const selectedCpfData = allCpfs.find(cpf => cpf.cpf === value);
        newValues['involvedName'] = selectedCpfData ? selectedCpfData.name : '';
      }

      return newValues;
    });
  };

  if (!isOpen || !formData) {
    return null;
  }

  const handleSave = () => {
    onSave(formData);
  };

  // Renderiza uma seção de campos
  const renderSection = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#374151', 
        marginBottom: '15px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );

  // Renderiza um campo de formulário padrão
  const renderField = (label: string, name: string, value: string | number, type: string = 'text', readOnly: boolean = false) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        style={{ 
          width: '100%', 
          padding: '8px', 
          borderRadius: '4px', 
          border: '1px solid #ccc',
          backgroundColor: readOnly ? '#e9ecef' : 'white',
          cursor: readOnly ? 'not-allowed' : 'auto'
        }}
        readOnly={readOnly}
      />
    </div>
  );

  // Renderiza um campo de seleção
  const renderSelectField = (label: string, name: string, value: string, options: string[]) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="">Selecione...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  // Renderiza um campo de texto longo
  const renderTextAreaField = (label: string, name: string, value: string) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={handleChange}
        rows={3}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
      />
    </div>
  );

  // NOVO: Renderiza um campo de seleção para CPFs
  const renderCpfLinkField = (label: string, name: string, value: string) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <select
        name={name}
        value={value || ''}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
      >
        <option value="">Nenhum</option>
        {allCpfs.map((cpf) => (
          <option key={cpf.id} value={cpf.cpf}>
            {`${cpf.name} (${cpf.cpf})`}
          </option>
        ))}
      </select>
    </div>
  );

  // Renderiza os campos do formulário com base no tipo do nó
  const renderFormFields = () => {
    // Identifica o tipo do nó para renderizar os campos corretos
    if ('cpf' in formData && !('cnpj' in formData)) { // CPF
      return <>
        {renderSection('Informações Pessoais', <>
          {renderField('Nome Completo', 'name', formData.name || '')}
          {renderField('CPF', 'cpf', formData.cpf || '', 'text', true)}
          {renderField('Tipo de Envolvimento', 'type', formData.type || '')}
        </>)}
        {renderSection('Informações Criminais', <>
          {renderField('Histórico Criminal', 'criminalRecord', formData.criminalRecord || '')}
          {renderField('Tipologia Criminal', 'criminalTypology', Array.isArray(formData.criminalTypology) ? formData.criminalTypology.join(', ') : formData.criminalTypology || '')}
        </>)}
        {renderSection('Vínculos', <>
          {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
          {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
        </>)}
        {renderSection('Informações Adicionais', <>
          {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          {renderField('Foto', 'photo', formData.photo || '')}
        </>)}
      </>;
    }
    if ('cnpj' in formData && !('cpf' in formData)) { // CNPJ
      return <>
        {renderSection('Informações da Empresa', <>
          {renderField('CNPJ', 'cnpj', formData.cnpj || '', 'text', true)}
          {renderField('Razão Social', 'companyName', formData.companyName || '')}
          {renderField('Tipologia', 'typology', formData.typology || '')}
        </>)}
        {renderSection('Localização', <>
          {renderField('Latitude', 'latitude', formData.latitude || 0, 'number')}
          {renderField('Longitude', 'longitude', formData.longitude || 0, 'number')}
        </>)}
        {renderSection('Vínculos', <>
          {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
          {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
        </>)}
        {renderSection('Informações Adicionais', <>
          {renderTextAreaField('Observações', 'notes', formData.notes || '')}
        </>)}
      </>;
    }
    if ('description' in formData && 'address' in formData && !('plate' in formData)) { // Imóvel
        return <>
          {renderSection('Informações do Imóvel', <>
            {renderField('Descrição do Imóvel', 'description', formData.description || '')}
            {renderField('Tipo de Vínculo', 'linkType', formData.linkType || '')}
          </>)}
          {renderSection('Endereço', <>
            {renderField('Endereço', 'address', formData.address || '')}
            {renderField('CEP', 'cep', formData.cep || '')}
            {renderField('Cidade', 'city', formData.city || '')}
            {renderField('Estado', 'state', formData.state || '')}
          </>)}
          {renderSection('Coordenadas', <>
            {renderField('Latitude', 'latitude', formData.latitude || 0, 'number')}
            {renderField('Longitude', 'longitude', formData.longitude || 0, 'number')}
          </>)}
          {renderSection('Vínculos', <>
            {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
            {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    if ('plate' in formData && 'brand' in formData && 'model' in formData) { // Veículo
        return <>
          {renderSection('Informações do Veículo', <>
            {renderField('Descrição', 'description', formData.description || '')}
            {renderField('Tipo de Vínculo', 'linkType', formData.linkType || '')}
            {renderField('Placa', 'plate', formData.plate || '')}
            {renderField('Marca', 'brand', formData.brand || '')}
            {renderField('Modelo', 'model', formData.model || '')}
            {renderField('Cor', 'color', formData.color || '')}
          </>)}
          {renderSection('Endereço', <>
            {renderField('Endereço', 'address', formData.address || '')}
            {renderField('CEP', 'cep', formData.cep || '')}
            {renderField('Cidade', 'city', formData.city || '')}
            {renderField('Estado', 'state', formData.state || '')}
          </>)}
          {renderSection('Coordenadas', <>
            {renderField('Latitude', 'latitude', formData.latitude || 0, 'number')}
            {renderField('Longitude', 'longitude', formData.longitude || 0, 'number')}
          </>)}
          {renderSection('Vínculos', <>
            {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
            {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    if ('number' in formData && 'owner' in formData && !('platform' in formData)) { // Telefone
        return <>
          {renderSection('Informações do Telefone', <>
            {renderField('Número', 'number', formData.number || '')}
            {renderField('Tipo de Vínculo', 'linkType', formData.linkType || '')}
          </>)}
          {renderSection('Proprietário', <>
            {renderField('Proprietário', 'owner', formData.owner || '')}
            {renderField('CPF do Proprietário', 'ownerCpf', formData.ownerCpf || '')}
          </>)}
          {renderSection('Vínculos', <>
            {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
            {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    if ('platform' in formData && 'profileName' in formData && !('number' in formData)) { // Rede Social
        return <>
          {renderSection('Informações da Rede Social', <>
            {renderField('Plataforma', 'platform', formData.platform || '')}
            {renderField('Link', 'link', formData.link || '')}
            {renderField('Nome do Perfil', 'profileName', formData.profileName || '')}
          </>)}
          {renderSection('Vínculos', <>
            {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
            {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    if ('transactionType' in formData && 'amount' in formData && !('involvedName' in formData)) { // Financeiro
        return <>
          {renderSection('Informações da Transação', <>
            {renderField('Tipo de Transação', 'transactionType', formData.transactionType || '')}
            {renderField('Valor', 'amount', formData.amount || 0, 'number')}
            {renderField('Dados Bancários', 'bankData', formData.bankData || '')}
          </>)}
          {renderSection('Proprietário', <>
            {renderField('CPF do Proprietário', 'ownerCpf', formData.ownerCpf || '')}
            {renderField('Nome do Proprietário', 'ownerName', formData.ownerName || '')}
          </>)}
          {renderSection('Remetente', <>
            {renderField('Nome Remetente', 'fromName', formData.fromName || '')}
            {renderField('CPF Remetente', 'fromCpf', formData.fromCpf || '')}
          </>)}
          {renderSection('Destinatário', <>
            {renderField('Nome Destinatário', 'toName', formData.toName || '')}
            {renderField('CPF Destinatário', 'toCpf', formData.toCpf || '')}
          </>)}
          {renderSection('Vínculos', <>
            {renderCpfLinkField('CPF Principal Vinculado', 'primaryLinkCpf', formData.primaryLinkCpf || '')}
            {renderField('Nome Principal Vinculado', 'primaryLinkName', formData.primaryLinkName || '', 'text', true)}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    if ('involvedName' in formData && 'sector' in formData && !('transactionType' in formData)) { // Empresarial
        return <>
          {renderSection('Informações do Envolvido', <>
            {renderCpfLinkField('CPF Envolvido', 'involvedCpf', formData.involvedCpf || '')}
            {renderField('Nome Envolvido', 'involvedName', formData.involvedName || '', 'text', true)}
            {renderField('Setor', 'sector', formData.sector || '')}
          </>)}
          {renderSection('Informações da Empresa', <>
            {renderField('Link Raizen', 'raizenLink', formData.raizenLink || '')}
            {renderField('Data de Início', 'startDate', formData.startDate || '', 'date')}
            {renderField('Data de Fim', 'endDate', formData.endDate || '', 'date')}
          </>)}
          {renderSection('Status', <>
            {renderSelectField('Ativo', 'active', formData.active || '', ['SIM', 'NÃO', 'N/A'])}
            {renderSelectField('Saiu Devido a Ocorrência', 'leftDueToOccurrence', formData.leftDueToOccurrence || '', ['SIM', 'NÃO', 'N/A'])}
          </>)}
          {renderSection('Informações Adicionais', <>
            {renderTextAreaField('Observações', 'notes', formData.notes || '')}
          </>)}
        </>;
    }
    
    return <p>Tipo de dado não reconhecido para edição.</p>;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '25px', borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '600px', maxWidth: '90vw',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', textAlign: 'center' }}>Editar Cadastro Completo</h2>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '15px',
          maxHeight: 'calc(90vh - 120px)'
        }}>
          {renderFormFields()}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px', 
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button onClick={onClose} style={{ 
            padding: '10px 20px', 
            borderRadius: '5px', 
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            color: '#374151',
            cursor: 'pointer',
            fontWeight: '500'
          }}>Cancelar</button>
          <button onClick={handleSave} style={{ 
            padding: '10px 20px', 
            borderRadius: '5px', 
            border: 'none', 
            backgroundColor: '#181a1b', 
            color: 'white', 
            cursor: 'pointer',
            fontWeight: '500'
          }}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};

type EditableData = CPF | CNPJ | Property | Vehicle | Phone | SocialNetwork | Financial | Corporate;

const CriminalBoard: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [searchCpf, setSearchCpf] = useState('');
  const [searchedCpf, setSearchedCpf] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeData, setEditingNodeData] = useState<EditableData | null>(null);

  const {
    cpfs, cnpjs, properties, vehicles, phones, socialNetworks, financials, corporates,
    fetchAllData, clearAllData,
    updateCpf, updateCnpj, updateProperty, updateVehicle, updatePhone,
    updateSocialNetwork, updateFinancial, updateCorporate
  } = useDataStore();

  // Efeito para buscar dados na montagem e limpar na desmontagem
  useEffect(() => {
    // Busca todos os dados quando o componente é montado
    fetchAllData();

    // Retorna uma função de limpeza que será chamada quando o componente for desmontado
    return () => {
      clearAllData();
    };
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setSelectedNode(nodeId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (e.clientX - rect.left - dragStart.x) / zoom;
        const newY = (e.clientY - rect.top - dragStart.y) / zoom;
        
        setNodes(prev => prev.map(node => 
          node.id === selectedNode 
            ? { ...node, x: node.x + newX, y: node.y + newY }
            : node
        ));
        
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
  };

  const handleEdit = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const originalId = nodeId.split('-')[1];
    let dataToEdit: EditableData | null = null;

    switch (node.type) {
      case 'CPF': dataToEdit = (cpfs.find(item => item.id === originalId) as CPF) || null; break;
      case 'CNPJ': dataToEdit = (cnpjs.find(item => item.id === originalId) as CNPJ) || null; break;
      case 'IMÓVEL': dataToEdit = (properties.find(item => item.id === originalId) as Property) || null; break;
      case 'VEÍCULO': dataToEdit = (vehicles.find(item => item.id === originalId) as Vehicle) || null; break;
      case 'TELEFONE': dataToEdit = (phones.find(item => item.id === originalId) as Phone) || null; break;
      case 'REDE SOCIAL': dataToEdit = (socialNetworks.find(item => item.id === originalId) as SocialNetwork) || null; break;
      case 'FINANCEIRO': dataToEdit = (financials.find(item => item.id === originalId) as Financial) || null; break;
      case 'EMPRESARIAL': dataToEdit = (corporates.find(item => item.id === originalId) as Corporate) || null; break;
    }

    if (dataToEdit) {
      setEditingNodeData(dataToEdit);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNodeData(null);
  };

  const handleSaveNode = (updatedData: EditableData) => {
    if (!editingNodeData) return;
    
    const id = editingNodeData.id;
    
    // Identifica o tipo baseado nas propriedades específicas do objeto
    if ('cpf' in updatedData && !('cnpj' in updatedData)) {
      updateCpf(id, updatedData as CPF);
    } else if ('cnpj' in updatedData && !('cpf' in updatedData)) {
      updateCnpj(id, updatedData as CNPJ);
    } else if ('description' in updatedData && 'address' in updatedData && !('plate' in updatedData)) {
      updateProperty(id, updatedData as Property);
    } else if ('plate' in updatedData && 'brand' in updatedData && 'model' in updatedData) {
      updateVehicle(id, updatedData as Vehicle);
    } else if ('number' in updatedData && 'owner' in updatedData && !('platform' in updatedData)) {
      updatePhone(id, updatedData as Phone);
    } else if ('platform' in updatedData && 'profileName' in updatedData && !('number' in updatedData)) {
      updateSocialNetwork(id, updatedData as SocialNetwork);
    } else if ('transactionType' in updatedData && 'amount' in updatedData && !('involvedName' in updatedData)) {
      updateFinancial(id, updatedData as Financial);
    } else if ('involvedName' in updatedData && 'sector' in updatedData && !('transactionType' in updatedData)) {
      updateCorporate(id, updatedData as Corporate);
    }

    handleCloseModal();
  };

  const handleSearch = () => {
    console.log('🚀 BOTÃO BUSCAR CLICADO!');
    if (!searchCpf.trim()) {
      console.log('❌ CPF vazio, retornando');
      return;
    }
    // Apenas define o CPF pesquisado. O useEffect cuidará do resto.
    setSearchedCpf(searchCpf.trim());
    setShowSuggestions(false); // Esconde sugestões após a busca
  };

  const handleClearSearch = () => {
    setSearchCpf('');
    setSearchedCpf(null);
    setNodes([]);
    setShowSuggestions(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

  const getConnections = () => {
    const connections: { from: Node; to: Node }[] = [];
    
    // Encontra o nó CPF principal (centro da rede)
    const cpfNode = nodes.find(node => node.type === 'CPF');
    
    if (cpfNode) {
      // Conecta todos os outros nós ao CPF principal
      nodes.forEach(node => {
        if (node.id !== cpfNode.id && node.primaryLinkCpf === cpfNode.primaryLinkCpf) {
          connections.push({ from: cpfNode, to: node });
        }
      });
    }
    
    return connections;
  };

  const connections = getConnections();

  // Fecha sugestões quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Recalcula o tamanho do canvas para caber todos os nós quando os nós mudam
    if (nodes.length === 0) {
      // Redefine para o tamanho padrão se não houver nós
      if (canvasSize.width !== 1200 || canvasSize.height !== 900) {
        setCanvasSize({ width: 1200, height: 900 });
      }
      return;
    }

    const padding = 200;
    const nodeSize = 120; // Diâmetro do círculo do nó
    const initialSize = { width: 1200, height: 900 };

    let requiredWidth = 0;
    let requiredHeight = 0;

    nodes.forEach(node => {
      // Verificamos os limites direito e inferior de cada nó
      requiredWidth = Math.max(requiredWidth, node.x + nodeSize);
      requiredHeight = Math.max(requiredHeight, node.y + nodeSize);
    });

    const newWidth = Math.max(initialSize.width, requiredWidth + padding);
    const newHeight = Math.max(initialSize.height, requiredHeight + padding);

    if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
      setCanvasSize({ width: newWidth, height: newHeight });
    }
  }, [nodes, canvasSize.width, canvasSize.height]);

  // Gera sugestões baseadas no texto digitado
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const inputClean = input.replace(/\D/g, '');
    const suggestionsList: string[] = [];

    const allCpfsInStore = [
      ...cpfs.map(c => c.cpf),
      ...cnpjs.map(c => c.primaryLinkCpf),
      ...properties.map(p => p.primaryLinkCpf),
      ...vehicles.map(v => v.primaryLinkCpf),
      ...phones.map(p => p.primaryLinkCpf),
      ...socialNetworks.map(s => s.primaryLinkCpf),
      ...financials.map(f => f.primaryLinkCpf),
      ...corporates.map(c => c.involvedCpf)
    ].filter((cpf): cpf is string => !!cpf);

    const uniqueCpfs = [...new Set(allCpfsInStore)];

    uniqueCpfs.forEach(cpf => {
      const cpfClean = cpf.replace(/\D/g, '');
      if (cpfClean.includes(inputClean)) {
        const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        if (!suggestionsList.includes(formattedCpf)) {
          suggestionsList.push(formattedCpf);
        }
      }
    });

    setSuggestions(suggestionsList.slice(0, 10));
  };

  // Atualiza sugestões quando o texto muda
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchCpf(value);
    setSelectedSuggestionIndex(-1);

    if (value.length >= 3) {
      generateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleciona uma sugestão e busca
  const selectSuggestion = (suggestion: string) => {
    setSearchCpf(suggestion);
    setSearchedCpf(suggestion.trim());
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // useEffect que filtra e cria os nós
  useEffect(() => {
    console.log(`Filtrando nós com o CPF: "${searchedCpf}"`);

    if (!searchedCpf) {
      setNodes([]);
      return;
    }

    const filteredNodes: Node[] = [];
    const searchedCpfClean = searchedCpf.replace(/\D/g, '');
    
    // CPF principal
    const matchingCpfs = cpfs.filter(cpf => cpf.cpf.replace(/\D/g, '').includes(searchedCpfClean));
    matchingCpfs.forEach(cpf => {
      filteredNodes.push({
        id: `cpf-${cpf.id}`, type: 'CPF', title: cpf.name, subtitle: cpf.cpf,
        x: 600, y: 400, color: '#3B82F6', primaryLinkCpf: cpf.cpf
      });
    });

    const otherData: Omit<Node, 'x' | 'y'>[] = [];
    
    // Filtra todos os outros dados
    cnpjs.filter(c => c.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(c => otherData.push({ id: `cnpj-${c.id}`, type: 'CNPJ', title: c.companyName, subtitle: c.cnpj, color: '#10B981', primaryLinkCpf: c.primaryLinkCpf }));
    properties.filter(p => p.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(p => otherData.push({ id: `property-${p.id}`, type: 'IMÓVEL', title: p.description, subtitle: p.address, color: '#F59E0B', primaryLinkCpf: p.primaryLinkCpf }));
    vehicles.filter(v => v.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(v => otherData.push({ id: `vehicle-${v.id}`, type: 'VEÍCULO', title: `${v.brand} ${v.model}`, subtitle: v.plate, color: '#EF4444', primaryLinkCpf: v.primaryLinkCpf }));
    phones.filter(p => p.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(p => otherData.push({ id: `phone-${p.id}`, type: 'TELEFONE', title: p.number, subtitle: p.owner, color: '#8B5CF6', primaryLinkCpf: p.primaryLinkCpf }));
    socialNetworks.filter(s => s.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(s => otherData.push({ id: `social-${s.id}`, type: 'REDE SOCIAL', title: s.platform, subtitle: s.profileName, color: '#EC4899', primaryLinkCpf: s.primaryLinkCpf }));
    financials.filter(f => f.primaryLinkCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(f => otherData.push({ id: `financial-${f.id}`, type: 'FINANCEIRO', title: f.transactionType, subtitle: `R$ ${f.amount.toLocaleString()}`, color: '#06B6D4', primaryLinkCpf: f.primaryLinkCpf }));
    corporates.filter(c => c.involvedCpf?.replace(/\D/g, '').includes(searchedCpfClean)).forEach(c => otherData.push({ id: `corporate-${c.id}`, type: 'EMPRESARIAL', title: c.involvedName, subtitle: c.sector, color: '#84CC16', primaryLinkCpf: c.involvedCpf }));

    // Posiciona os nós em um círculo
    const centerX = 600, centerY = 400, radius = 250;
    const angleStep = (2 * Math.PI) / Math.max(otherData.length, 1);
    otherData.forEach((node, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      filteredNodes.push({ ...node, x: Math.round(x), y: Math.round(y) });
    });

    console.log('✅ Nós finais criados:', filteredNodes.length);
    setNodes(filteredNodes);

  }, [searchedCpf, cpfs, cnpjs, properties, vehicles, phones, socialNetworks, financials, corporates]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      position: 'relative',
      backgroundColor: '#f8fafc'
    }}>
      <EditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNode}
        node={editingNodeData}
        allCpfs={cpfs}
      />
      {/* Search Bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative'
        }}>
          <label style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#374151'
          }}>
            Buscar CPF
          </label>
          <input
            ref={searchInputRef}
            type="text"
            value={searchCpf}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                  selectSuggestion(suggestions[selectedSuggestionIndex]);
                } else {
                  handleSearch();
                }
              }
            }}
            placeholder="Digite o CPF (ex: 123.456.789-00)"
            style={{
              width: '250px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3B82F6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
          
          {/* Dropdown de sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1001,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Clique na sugestão:', suggestion);
                    selectSuggestion(suggestion);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedSuggestionIndex ? '#F3F4F6' : 'transparent',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchCpf.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: isSearching || !searchCpf.trim() ? '#9CA3AF' : '#181a1b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isSearching || !searchCpf.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
            marginTop: '20px'
          }}
        >
          {isSearching ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Buscando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              Buscar
            </>
          )}
        </button>
        {searchedCpf && (
          <button
            onClick={handleClearSearch}
            style={{
              padding: '8px 12px',
              backgroundColor: '#181a1b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
              marginTop: '20px'
            }}
            title="Limpar busca"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Limpar
          </button>
        )}
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#181a1b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#181a1b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          -
        </button>
      </div>

      {/* Mensagem quando não há busca */}
      {!searchedCpf && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            backgroundColor: '#F3F4F6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#9CA3AF">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <div>Digite um CPF para buscar e visualizar os dados</div>
        </div>
      )}

      {/* Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          margin: '0 auto',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connection Lines */}
        <svg
          style={{
            position: 'absolute',
            top: `-${canvasSize.height}px`,
            left: `-${canvasSize.width}px`,
            width: `${canvasSize.width * 3}px`,
            height: `${canvasSize.height * 3}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {connections.map((connection, index) => {
            return (
              <line
                key={index}
                x1={connection.from.x + 60 + canvasSize.width}
                y1={connection.from.y + 60 + canvasSize.height}
                x2={connection.to.x + 60 + canvasSize.width}
                y2={connection.to.y + 60 + canvasSize.height}
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: '120px',
              height: '120px',
              backgroundColor: node.color,
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: selectedNode === node.id ? '0 0 0 3px #FCD34D' : '0 4px 6px rgba(0,0,0,0.1)',
              border: '3px solid white',
              zIndex: 2,
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            {/* Ícone principal */}
            <div style={{
              color: 'white',
              marginBottom: '6px'
            }}>
              <GenericIcon type={node.type} size={28} />
            </div>
            
            {/* Texto do título */}
            <div style={{
              fontSize: '9px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '2px'
            }}>
              {node.title}
            </div>
            
            {/* Texto do subtítulo */}
            <div style={{
              fontSize: '7px',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {node.subtitle}
            </div>
            
            {/* Botão de edição */}
            <button
              onMouseDown={(e) => handleEdit(e, node.id)}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '20px',
                height: '20px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
                fontSize: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 3
              }}
              title="Editar"
            >
              <EditIcon size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* CSS para animação de loading */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CriminalBoard;