import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Download, Upload, Eye, Edit2, Trash2, FileImage, X, FileText } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { CPF } from '../../types';
import { FileUpload } from '../FileUpload';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { createProfessionalPDF, formatArray } from '../../utils/pdfUtils';

type TabType = 'consult' | 'register';

export const CPFModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCpf, setEditingCpf] = useState<CPF | null>(null);
  const [viewingCpf, setViewingCpf] = useState<CPF | null>(null);
  const { cpfs, addCpf, updateCpf, deleteCpf, fetchCpfs, loading } = useDataStore();

  // Form state
  const [formData, setFormData] = useState({
    cpf: '',
    name: '',
    type: '',
    criminalRecord: '',
    criminalTypology: [] as string[],
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    photo: '',
    documents: [] as any[],
    connections: [] as any[]
  });

  // Carregar CPFs quando o componente for montado
  useEffect(() => {
    console.log('CPFModule: Carregando CPFs...');
    fetchCpfs();
  }, [fetchCpfs]);

  // Debug: Log quando cpfs mudar
  useEffect(() => {
    console.log('CPFModule: CPFs carregados:', cpfs.length, cpfs);
  }, [cpfs]);

  const filteredCpfs = cpfs.filter(cpf => {
    const term = searchTerm.toLowerCase();
    const cpfMatch = cpf.cpf && cpf.cpf.toLowerCase().includes(term);
    const nameMatch = cpf.name && cpf.name.toLowerCase().includes(term);
    const typeMatch = cpf.type && cpf.type.toLowerCase().includes(term);
    return cpfMatch || nameMatch || typeMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('--- CPF SUBMIT HANDLER HIT ---');
    console.log('Editing CPF:', editingCpf);
    console.log('Form data:', formData);
    console.log('--------------------------');
    
    if (editingCpf) {
      console.log('Updating existing CPF with ID:', editingCpf.id);
      updateCpf(editingCpf.id, formData);
      setEditingCpf(null);
    } else {
      console.log('Creating new CPF');
      addCpf(formData);
    }
    
    // Reset form
    setFormData({
      cpf: '',
      name: '',
      type: '',
      criminalRecord: '',
      criminalTypology: [],
      primaryLinkCpf: '',
      primaryLinkName: '',
      notes: '',
      photo: '',
      documents: [],
      connections: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (cpf: CPF) => {
    console.log('--- CPF EDIT HANDLER HIT ---');
    console.log('CPF to edit:', cpf);
    console.log('CPF criminalTypology:', cpf.criminalTypology);
    console.log('CPF criminalTypology type:', typeof cpf.criminalTypology);
    console.log('--------------------------');
    
    // Ensure criminalTypology is always an array
    let criminalTypology = cpf.criminalTypology;
    if (typeof criminalTypology === 'string') {
      try {
        criminalTypology = JSON.parse(criminalTypology);
      } catch (e) {
        criminalTypology = [];
      }
    } else if (!Array.isArray(criminalTypology)) {
      criminalTypology = [];
    }
    
    // Ensure documents is always an array
    let documents = cpf.documents;
    if (typeof documents === 'string') {
      try {
        documents = JSON.parse(documents);
      } catch (e) {
        documents = [];
      }
    } else if (!Array.isArray(documents)) {
      documents = [];
    }
    
    // Ensure connections is always an array
    let connections = cpf.connections;
    if (typeof connections === 'string') {
      try {
        connections = JSON.parse(connections);
      } catch (e) {
        connections = [];
      }
    } else if (!Array.isArray(connections)) {
      connections = [];
    }
    
    const formDataToSet = {
      cpf: cpf.cpf || '',
      name: cpf.name || '',
      type: cpf.type || '',
      criminalRecord: cpf.criminalRecord || '',
      criminalTypology: criminalTypology,
      primaryLinkCpf: cpf.primaryLinkCpf || '',
      primaryLinkName: cpf.primaryLinkName || '',
      notes: cpf.notes || '',
      photo: cpf.photo || '',
      documents: documents,
      connections: connections
    };
    
    console.log('Form data to set:', formDataToSet);
    console.log('--------------------------');
    
    setFormData(formDataToSet);
    setEditingCpf(cpf);
    setActiveTab('register');
  };

  const handleView = (cpf: CPF) => {
    setViewingCpf(cpf);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este CPF?')) {
      deleteCpf(id);
    }
  };

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Função para exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de CPFs', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'CPF',
        'Nome',
        'Tipo',
        'Antecedentes',
        'Criado por'
      ]],
      body: filteredCpfs.map(cpf => [
        cpf.cpf,
        cpf.name,
        cpf.type,
        cpf.criminalRecord || 'Sem antecedentes',
        cpf.createdBy || 'N/A'
      ]),
    });
    doc.save('cpfs.pdf');
  };

  // Função para exportar PDF individual de um CPF
  const handleExportCPF = (cpf: CPF) => {
    const doc = new jsPDF();
    
    const sections = [
      {
        title: 'INFORMAÇÕES PESSOAIS',
        content: [
          { label: 'Nome', value: cpf.name || 'Não informado' },
          { label: 'CPF', value: cpf.cpf || 'Não informado' },
          { label: 'Tipo', value: cpf.type || 'Não informado' }
        ]
      },
      {
        title: 'ANTECEDENTES CRIMINAIS',
        content: [
          { label: 'Antecedentes', value: cpf.criminalRecord || 'Sem antecedentes' },
          { label: 'Tipologia Criminal', value: formatArray(cpf.criminalTypology) }
        ]
      },
      {
        title: 'VÍNCULOS',
        content: [
          { label: 'Vínculo Primário', value: cpf.primaryLinkName || 'Não informado' },
          { label: 'CPF do Vínculo', value: cpf.primaryLinkCpf || 'Não informado' }
        ]
      },
      {
        title: 'OBSERVAÇÕES',
        content: [
          { label: 'Observações', value: cpf.notes || 'Nenhuma observação registrada' }
        ]
      }
    ];
    
    createProfessionalPDF(doc, 'CPF', sections, {
      createdBy: cpf.createdBy || 'Sistema',
      identifier: cpf.cpf || 'cadastro'
    });
    
    doc.save(`cpf-${cpf.cpf || 'cadastro'}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <User className="h-5 w-5 text-black mr-2" />
          Gerenciamento de CPF
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de pessoas físicas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar CPF', icon: Search },
            { id: 'register', label: 'Cadastrar CPF', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center rounded-t-md transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-neutral-300' : 'bg-transparent'
              }`}
              style={activeTab === tab.id ? { backgroundColor: '#d4d4d4', color: '#000' } : { color: '#000' }}
            >
              <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-black' : 'text-black'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'consult' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por CPF, nome ou tipo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                style={{ backgroundColor: '#181a1b' }}
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* CPF Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Antecedentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado por
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading.cpfs ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                          <p className="text-lg font-medium">Carregando CPFs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCpfs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {cpfs.length === 0 ? (
                          <div className="flex flex-col items-center">
                            <User className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Nenhum CPF cadastrado</p>
                            <p className="text-sm">Clique em "Cadastrar CPF" para adicionar o primeiro registro.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Search className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Nenhum CPF encontrado</p>
                            <p className="text-sm">Tente ajustar os termos de busca.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCpfs.map((cpf) => (
                      <tr key={cpf.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cpf.cpf}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cpf.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cpf.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {cpf.criminalRecord || 'Sem antecedentes'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cpf.createdBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleView(cpf)}
                            className="text-black hover:text-black"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cpf)}
                            className="text-black hover:text-black"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cpf.id)}
                            className="text-black hover:text-black"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportCPF(cpf)}
                            className="text-black hover:text-black"
                            title="Exportar PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {viewingCpf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Detalhes do CPF</h2>
              <button
                onClick={() => setViewingCpf(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto */}
              <div className="md:col-span-2 flex justify-center">
                <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {viewingCpf.photo ? (
                    <img
                      src={viewingCpf.photo}
                      alt="Foto do envolvido"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Sem foto</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.cpf}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Envolvimento</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.type}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criado por</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.createdBy || 'N/A'}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia Criminal</label>
                <p className="text-sm text-gray-900 mb-4">
                  {Array.isArray(viewingCpf.criminalTypology) 
                    ? viewingCpf.criminalTypology.join(', ') 
                    : viewingCpf.criminalTypology || 'Não informado'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes Criminais</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.criminalRecord || 'Sem antecedentes'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Vínculo Primário</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.primaryLinkCpf || 'Não informado'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Vínculo Primário</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.primaryLinkName || 'Não informado'}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <p className="text-sm text-gray-900 mb-4">{viewingCpf.notes || 'Sem observações'}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingCpf(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Plus className="h-5 w-5 text-black mr-2" />
            {editingCpf ? 'Editar CPF' : 'Cadastrar Novo CPF'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um CPF.</p>

          <div className="flex justify-end gap-2 mb-6 -mt-24">
             <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                style={{ backgroundColor: '#181a1b' }}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </button>
              <a
                href="/modelos/Modelo_CPF.xlsx"
                download
                className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                style={{ backgroundColor: '#181a1b' }}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo
              </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção da Foto Centralizada */}
            <div className="flex flex-col items-center justify-center pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do envolvido
              </label>
              <div className="relative">
                <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Foto do envolvido"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Foto 3x4</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            {/* Demais Campos do Formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo do indivíduo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Envolvimento *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Primário">Primário</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Secundário">Secundário</option>
                  <option value="Ocultação de B&V">Ocultação de B&V</option>
                  <option value="Vínculo pessoal não definido">Vínculo pessoal não definido</option>
                  <option value="Vínculo comercial">Vínculo comercial</option>
                  <option value="Vínculo empresarial">Vínculo empresarial</option>
                  <option value="Vínculo de círculo de amizade">Vínculo de círculo de amizade</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipologia Criminal
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={Array.isArray(formData.criminalTypology) ? formData.criminalTypology.join(', ') : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const typologyArray = value ? value.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
                    setFormData(prev => ({ ...prev, criminalTypology: typologyArray }));
                  }}
                  placeholder="Ex: Furto, Roubo, Estelionato (separado por vírgulas)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedentes Criminais
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.criminalRecord}
                  onChange={(e) => setFormData(prev => ({ ...prev, criminalRecord: e.target.value }))}
                  placeholder="Descreva os antecedentes criminais, se houver."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Vínculo Primário
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.primaryLinkCpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryLinkCpf: formatCpf(e.target.value) }))}
                  placeholder="CPF do principal contato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Vínculo Primário
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.primaryLinkName}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryLinkName: e.target.value }))}
                  placeholder="Nome do principal contato"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Insira informações adicionais, se necessário."
                />
              </div>
              
              {/* Campo de Anexos */}
              <div className="md:col-span-2">
                <FileUpload
                  documents={formData.documents}
                  onDocumentsChange={(documents) => setFormData(prev => ({ ...prev, documents }))}
                  label="Anexos"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={() => setActiveTab('consult')}
                className="mr-4 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-white rounded-lg hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: '#181a1b' }}
              >
                {editingCpf ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};