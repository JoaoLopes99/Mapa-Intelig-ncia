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
  isExpanded?: boolean;
  platform?: string;
}

// Componente para ícones específicos de redes sociais
const SocialNetworkIcon: React.FC<{ platform: string; size?: number }> = ({ platform, size = 24 }) => {
  const platformLower = platform.toLowerCase();
  
  const getIcon = () => {
    switch (platformLower) {
      case 'youtube':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243 0 .49-.122.928-.49 1.243-.369.315-.807.49-1.297.49z"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'whatsapp':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        );
      case 'telegram':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        );
      case 'discord':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        );
      default:
        // Ícone genérico para redes sociais não reconhecidas
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
    }
  };
  
  return getIcon();
};

// Componente para ícones genéricos baseados no tipo
const GenericIcon: React.FC<{ type: string; size?: number; platform?: string }> = ({ type, size = 24, platform }) => {
  // Se for rede social e tiver plataforma específica, usa o ícone específico
  if (type === 'REDE SOCIAL' && platform) {
    return <SocialNetworkIcon platform={platform} size={size} />;
  }

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

// Componente para ícone de expandir/recolher
const ExpandIcon: React.FC<{ isExpanded: boolean; size?: number }> = ({ isExpanded, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    {isExpanded ? (
      // Ícone de recolher (menos)
      <path d="M19 13H5v-2h14v2z"/>
    ) : (
      // Ícone de expandir (mais)
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    )}
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
        newValues['primaryLinkCpf'] = value;
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
          {formData.documents && formData.documents.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Documentos Anexados</h4>
              <ul className="list-disc pl-5">
                {formData.documents.map((doc: any, idx: any) => (
                  <li key={idx}>
                    <a
                      href={doc.url || doc.path || doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                      download
                    >
                      {doc.name || `Documento ${idx + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
  const [searchedCpfs, setSearchedCpfs] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeData, setEditingNodeData] = useState<EditableData | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
    const cpf = searchCpf.trim();
    if (!cpf) return;
    if (searchedCpfs.includes(cpf)) return; // Não adiciona duplicado
    setSearchedCpfs(prev => [...prev, cpf]);
    setSearchCpf('');
    setShowSuggestions(false);
  };

  const handleRemoveCpf = (cpf: string) => {
    setSearchedCpfs(prev => prev.filter(c => c !== cpf));
    setExpandedNodes(prev => {
      // Remove expansão dos nós relacionados a esse CPF
      const newSet = new Set([...prev]);
      for (const id of newSet) {
        if (id.endsWith(cpf.replace(/\D/g, ''))) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
  };

  const handleClearSearch = () => {
    setSearchCpf('');
    setSearchedCpfs([]);
    setNodes([]);
    setExpandedNodes(new Set());
    setShowSuggestions(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

  // Função para expandir/recolher vínculos de um nó
  const handleToggleExpansion = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getConnections = () => {
    const connections: { from: Node; to: Node }[] = [];

    // Sempre desenha a linha entre o principal e os CPFs vinculados
    nodes.forEach(node => {
      if (
        node.type === 'CPF' &&
        node.primaryLinkCpf &&
        node.primaryLinkCpf !== node.subtitle
      ) {
        const primaryNode = nodes.find(
          n => n.type === 'CPF' && n.subtitle === node.primaryLinkCpf
        );
        if (primaryNode) {
          connections.push({ from: primaryNode, to: node });
        }
      }
    });

    // Liga cada CPF aos seus vínculos (ícones) só se estiver expandido
    nodes.forEach(fromNode => {
      if (fromNode.type === 'CPF' && expandedNodes.has(fromNode.id)) {
        nodes.forEach(toNode => {
          if (
            toNode.id !== fromNode.id &&
            toNode.primaryLinkCpf === fromNode.subtitle &&
            toNode.type !== 'CPF'
          ) {
            connections.push({ from: fromNode, to: toNode });
          }
        });
      }
    });

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
    setSearchedCpfs(prev => [...prev, suggestion.trim()]);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Função utilitária para includes seguro
  function safeIncludes(arr: string[], value: string | undefined): boolean {
    return !!value && arr.includes(value);
  }

  // useEffect que filtra e cria os nós
  useEffect(() => {
    if (searchedCpfs.length === 0) {
      setNodes([]);
      return;
    }

    // Utilitário para evitar duplicidade de nós
    const nodeMap = new Map<string, Node>();
    const processedCpfs = new Set<string>();
    const nodesToProcess: { cpf: string, x: number, y: number, depth: number }[] = [];
    const centerX = 600, centerY = 400;
    const cpfRadius = 200;
    const linkRadius = 150;
    
    // Mapeia posições existentes dos nós
    const existingNodePositions: { [id: string]: { x: number; y: number } } = {};
    nodes.forEach(node => {
      existingNodePositions[node.id] = { x: node.x, y: node.y };
    });

    // Inicializa com os CPFs buscados
    searchedCpfs.forEach((cpf, idx) => {
      const cpfData = cpfs.find(c => c.cpf === cpf);
      const cpfNodeId = cpfData ? `cpf-${cpfData.id}` : `cpf-missing-${cpf}`;
      let x, y;
      if (existingNodePositions[cpfNodeId]) {
        x = existingNodePositions[cpfNodeId].x;
        y = existingNodePositions[cpfNodeId].y;
      } else {
        const angle = (idx * 2 * Math.PI) / Math.max(searchedCpfs.length, 1);
        x = centerX + cpfRadius * Math.cos(angle);
        y = centerY + cpfRadius * Math.sin(angle);
      }
      nodesToProcess.push({ cpf, x, y, depth: 0 });
    });

    while (nodesToProcess.length > 0) {
      const { cpf, x, y, depth } = nodesToProcess.shift()!;
      if (processedCpfs.has(cpf)) continue;
      processedCpfs.add(cpf);

      // Adiciona o nó CPF (sempre azul)
      let cpfData = cpfs.find(c => c.cpf === cpf);
      let cpfNodeId = cpfData ? `cpf-${cpfData.id}` : `cpf-missing-${cpf}`;
      let nodeX = x, nodeY = y;
      if (existingNodePositions[cpfNodeId]) {
        nodeX = existingNodePositions[cpfNodeId].x;
        nodeY = existingNodePositions[cpfNodeId].y;
      }
      if (!nodeMap.has(cpfNodeId)) {
        nodeMap.set(cpfNodeId, {
          id: cpfNodeId,
          type: 'CPF',
          title: cpfData ? cpfData.name : 'CPF não encontrado',
          subtitle: cpf,
          x: Math.round(nodeX),
          y: Math.round(nodeY),
          color: '#3B82F6',
          primaryLinkCpf: cpfData ? cpfData.primaryLinkCpf : ''
        });
      }

      // Busca vínculos desse CPF
      const links: Omit<Node, 'x' | 'y'>[] = [];
      cnpjs.filter(c => c.primaryLinkCpf === cpf).forEach(c => {
        links.push({ id: `cnpj-${c.id}`, type: 'CNPJ', title: c.companyName, subtitle: c.cnpj, color: '#10B981', primaryLinkCpf: c.primaryLinkCpf });
      });
      properties.filter(p => p.primaryLinkCpf === cpf).forEach(p => {
        links.push({ id: `property-${p.id}`, type: 'IMÓVEL', title: p.description, subtitle: p.address, color: '#F59E0B', primaryLinkCpf: p.primaryLinkCpf });
      });
      vehicles.filter(v => v.primaryLinkCpf === cpf).forEach(v => {
        links.push({ id: `vehicle-${v.id}`, type: 'VEÍCULO', title: `${v.brand} ${v.model}`, subtitle: v.plate, color: '#EF4444', primaryLinkCpf: v.primaryLinkCpf });
      });
      phones.filter(p => p.primaryLinkCpf === cpf).forEach(p => {
        links.push({ id: `phone-${p.id}`, type: 'TELEFONE', title: p.number, subtitle: p.owner, color: '#8B5CF6', primaryLinkCpf: p.primaryLinkCpf });
      });
      socialNetworks.filter(s => s.primaryLinkCpf === cpf).forEach(s => {
        links.push({ id: `social-${s.id}`, type: 'REDE SOCIAL', title: s.platform, subtitle: s.profileName, color: '#EC4899', primaryLinkCpf: s.primaryLinkCpf, platform: s.platform });
      });
      financials.filter(f => f.primaryLinkCpf === cpf).forEach(f => {
        links.push({ id: `financial-${f.id}`, type: 'FINANCEIRO', title: f.transactionType, subtitle: `R$ ${f.amount.toLocaleString()}`, color: '#06B6D4', primaryLinkCpf: f.primaryLinkCpf });
      });
      corporates.filter(c => c.involvedCpf === cpf).forEach(c => {
        links.push({ id: `corporate-${c.id}`, type: 'EMPRESARIAL', title: c.involvedName, subtitle: c.sector, color: '#84CC16', primaryLinkCpf: c.involvedCpf });
      });

      // CPFs vinculados a este CPF
      const linkedCpfs = cpfs.filter(c => c.primaryLinkCpf === cpf && c.cpf !== cpf);
      linkedCpfs.forEach((linked, idx) => {
        const linkedNodeId = `cpf-${linked.id}`;
        let lx, ly;
        if (existingNodePositions[linkedNodeId]) {
          lx = existingNodePositions[linkedNodeId].x;
          ly = existingNodePositions[linkedNodeId].y;
        } else {
          const angle = Math.PI + (idx * 2 * Math.PI) / Math.max(linkedCpfs.length, 1);
          lx = x + cpfRadius * Math.cos(angle);
          ly = y + cpfRadius * Math.sin(angle);
        }
        nodesToProcess.push({ cpf: linked.cpf, x: lx, y: ly, depth: depth + 1 });
      });

      // Posiciona os vínculos ao redor do CPF
      links.forEach((link, idx) => {
        let vx, vy;
        if (existingNodePositions[link.id]) {
          vx = existingNodePositions[link.id].x;
          vy = existingNodePositions[link.id].y;
        } else {
          const angle = (idx * 2 * Math.PI) / Math.max(links.length, 1);
          vx = x + linkRadius * Math.cos(angle);
          vy = y + linkRadius * Math.sin(angle);
        }
        if (!nodeMap.has(link.id)) {
          nodeMap.set(link.id, { ...link, x: Math.round(vx), y: Math.round(vy) });
        }
      });
    }

    setNodes(Array.from(nodeMap.values()));
    // Expande todos os CPFs automaticamente, mantendo os já expandidos
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
      Array.from(nodeMap.values())
        .filter(n => n.type === 'CPF')
        .forEach(n => newSet.add(n.id));
        return newSet;
      });
  }, [searchedCpfs, cpfs, cnpjs, properties, vehicles, phones, socialNetworks, financials, corporates]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      position: 'relative',
      backgroundColor: '#f8fafc'
    }}>
      {searchedCpfs.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {searchedCpfs.map(cpf => (
            <span key={cpf} style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F3F4F6',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '13px',
              color: '#181a1b',
              fontWeight: 500,
              marginRight: '4px',
              marginBottom: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {cpf}
              <button onClick={() => handleRemoveCpf(cpf)} style={{
                marginLeft: '6px',
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '15px',
                lineHeight: 1
              }} title="Remover CPF">×</button>
            </span>
          ))}
        </div>
      )}
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
        {searchedCpfs.length > 0 && (
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
      {!searchedCpfs.length && (
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
        {nodes.filter(node => {
          if (node.type === 'CPF') {
            // Sempre mostra todos os CPFs (principal e vinculados)
              return true;
          }
          // Se não é CPF, só mostra se o CPF vinculado está expandido
          const linkedCpfNode = nodes.find(n => n.type === 'CPF' && n.subtitle === node.primaryLinkCpf);
          return linkedCpfNode && expandedNodes.has(linkedCpfNode.id);
        }).map((node) => (
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
              <GenericIcon type={node.type} size={28} platform={node.platform} />
            </div>
            {/* Badge para CPF principal/vinculado */}
            {node.type === 'CPF' && (
              <div style={{position:'absolute',top:6,left:6,background:'#fff',color:'#3B82F6',borderRadius:'6px',padding:'2px 6px',fontSize:'10px',fontWeight:'bold',boxShadow:'0 1px 4px #0002'}}>
                {searchedCpfs.includes(node.subtitle) ? 'PRINCIPAL' : 'VINCULADO'}
              </div>
            )}
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
            {/* Botões de ação */}
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              display: 'flex',
              gap: '4px',
              zIndex: 3
            }}>
              {/* Botão de expandir/recolher: sempre para todos os CPFs */}
              {node.type === 'CPF' && (
                <button
                  onMouseDown={(e) => handleToggleExpansion(e, node.id)}
                  style={{
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  title={expandedNodes.has(node.id) 
                    ? `Recolher vínculos`
                    : `Expandir vínculos`
                  }
                >
                  <ExpandIcon isExpanded={expandedNodes.has(node.id)} size={10} />
                </button>
              )}
            {/* Botão de edição */}
            <button
              onMouseDown={(e) => handleEdit(e, node.id)}
              style={{
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Editar"
            >
              <EditIcon size={10} />
            </button>
            </div>
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