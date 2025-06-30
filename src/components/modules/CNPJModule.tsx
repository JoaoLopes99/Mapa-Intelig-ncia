import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Download, Upload, Edit2, Trash2, Eye, MapPin, FileText } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { CNPJ } from '../../types';
import { FileUpload } from '../FileUpload';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { createProfessionalPDF, formatArray } from '../../utils/pdfUtils';

type TabType = 'consult' | 'register';

export const CNPJModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCnpj, setEditingCnpj] = useState<CNPJ | null>(null);
  const [selectedCnpj, setSelectedCnpj] = useState<CNPJ | null>(null);
  
  const { cnpjs, cpfs, addCnpj, updateCnpj, deleteCnpj, fetchCnpjs, loading } = useDataStore();

  // Carregar CNPJs quando o componente for montado
  useEffect(() => {
    console.log('CNPJModule: Carregando CNPJs...');
    fetchCnpjs();
  }, [fetchCnpjs]);

  // Debug: Log quando cnpjs mudar
  useEffect(() => {
    console.log('CNPJModule: CNPJs carregados:', cnpjs.length, cnpjs);
  }, [cnpjs]);

  // Form state
  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    typology: '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as any[]
  });

  const filteredCnpjs = cnpjs.filter(cnpj =>
    cnpj.cnpj.includes(searchTerm) ||
    cnpj.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cnpj.typology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cnpjData = {
      ...formData,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    if (editingCnpj) {
      updateCnpj(editingCnpj.id, cnpjData);
      setEditingCnpj(null);
    } else {
      addCnpj(cnpjData);
    }
    
    // Reset form
    setFormData({
      cnpj: '',
      companyName: '',
      typology: '',
      latitude: 0,
      longitude: 0,
      primaryLinkCpf: '',
      primaryLinkName: '',
      notes: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (cnpj: CNPJ) => {
    setFormData({
      cnpj: cnpj.cnpj,
      companyName: cnpj.companyName,
      typology: cnpj.typology,
      latitude: cnpj.latitude,
      longitude: cnpj.longitude,
      primaryLinkCpf: cnpj.primaryLinkCpf || '',
      primaryLinkName: cnpj.primaryLinkName || '',
      notes: cnpj.notes,
      documents: cnpj.documents
    });
    setEditingCnpj(cnpj);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este CNPJ?')) {
      deleteCnpj(id);
    }
  };

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleLatitudeChange = (value: string) => {
    const lat = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      latitude: lat
    }));
  };

  const handleLongitudeChange = (value: string) => {
    const lng = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      longitude: lng
    }));
  };

  // Função para exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de CNPJs', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'CNPJ',
        'Nome da Empresa',
        'Tipologia',
        'Vínculo Primário',
        'Criado por'
      ]],
      body: filteredCnpjs.map(cnpj => [
        cnpj.cnpj,
        cnpj.companyName,
        cnpj.typology,
        cnpj.primaryLinkName || 'N/A',
        cnpj.createdBy || 'N/A'
      ]),
    });
    doc.save('cnpjs.pdf');
  };

  // Função para exportar PDF individual de um CNPJ
  const handleExportCNPJ = (cnpj: CNPJ) => {
    const doc = new jsPDF();
    
    const sections = [
      {
        title: 'INFORMAÇÕES EMPRESARIAIS',
        content: [
          { label: 'CNPJ', value: cnpj.cnpj || 'Não informado' },
          { label: 'Razão Social', value: cnpj.companyName || 'Não informado' },
          { label: 'Tipologia', value: cnpj.typology || 'Não informado' }
        ]
      },
      {
        title: 'LOCALIZAÇÃO',
        content: [
          { label: 'Latitude', value: cnpj.latitude ? cnpj.latitude.toString() : 'Não informado' },
          { label: 'Longitude', value: cnpj.longitude ? cnpj.longitude.toString() : 'Não informado' }
        ]
      },
      {
        title: 'VÍNCULOS',
        content: [
          { label: 'Vínculo Primário', value: cnpj.primaryLinkName || 'Não informado' },
          { label: 'CPF do Vínculo', value: cnpj.primaryLinkCpf || 'Não informado' }
        ]
      },
      {
        title: 'OBSERVAÇÕES',
        content: [
          { label: 'Observações', value: cnpj.notes || 'Nenhuma observação registrada' }
        ]
      }
    ];
    
    createProfessionalPDF(doc, 'CNPJ', sections, {
      createdBy: cnpj.createdBy || 'Sistema',
      identifier: cnpj.cnpj || 'cadastro'
    });
    
    doc.save(`cnpj-${cnpj.cnpj || 'cadastro'}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building className="h-8 w-8 text-black mr-3" />
          Gerenciamento de CNPJ
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de pessoas jurídicas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar CNPJ', icon: Search },
            { id: 'register', label: 'Cadastrar CNPJ', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center rounded-t-md transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-neutral-200 text-white border-transparent'
                  : 'bg-transparent text-black border-transparent hover:bg-neutral-100'
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
                  placeholder="Buscar por CNPJ, nome da empresa ou tipologia..."
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

          {/* CNPJ Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome da Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipologia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vínculo Primário
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
                  {loading.cnpjs ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                          <p className="text-lg font-medium">Carregando CNPJs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCnpjs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {cnpjs.length === 0 ? (
                          <div className="flex flex-col items-center">
                            <Building className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Nenhum CNPJ cadastrado</p>
                            <p className="text-sm">Clique em "Cadastrar CNPJ" para adicionar o primeiro registro.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Search className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Nenhum CNPJ encontrado</p>
                            <p className="text-sm">Tente ajustar os termos de busca.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCnpjs.map((cnpj) => (
                      <tr key={cnpj.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cnpj.cnpj}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cnpj.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {cnpj.typology}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cnpj.primaryLinkName || 'Sem vínculo'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cnpj.createdBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedCnpj(cnpj)}
                            className="text-black hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cnpj)}
                            className="text-black hover:text-black"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cnpj.id)}
                            className="text-black hover:text-black"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportCNPJ(cnpj)}
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

      {activeTab === 'register' && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Plus className="h-5 w-5 text-black mr-2" />
            {editingCnpj ? 'Editar CNPJ' : 'Cadastrar Novo CNPJ'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um CNPJ.</p>
          
          <div className="flex justify-end gap-2 mb-6 -mt-16">
            <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              style={{ backgroundColor: '#181a1b' }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </button>
            <a
              href="/modelos/Modelo_CNPJ.xlsx"
              download
              className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              style={{ backgroundColor: '#181a1b' }}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo
            </a>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCnpj(e.target.value) }))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Razão social da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipologia *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.typology}
                  onChange={(e) => setFormData(prev => ({ ...prev, typology: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Sócio/Administrador">Sócio/Administrador</option>
                  <option value="Empregado">Empregado</option>
                  <option value="Ocultação B&V">Ocultação B&V</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.latitude.toString()}
                  onChange={(e) => handleLatitudeChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.longitude.toString()}
                  onChange={(e) => handleLongitudeChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF Vínculo Primário
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.primaryLinkCpf}
                  onChange={(e) => {
                    const selectedCpf = cpfs.find(c => c.cpf === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      primaryLinkCpf: e.target.value,
                      primaryLinkName: selectedCpf?.name || ''
                    }));
                  }}
                >
                  <option value="">Selecione...</option>
                  {cpfs.map(cpf => (
                    <option key={cpf.id} value={cpf.cpf}>
                      {cpf.cpf} - {cpf.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Vínculo Primário
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.primaryLinkName}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    cnpj: '',
                    companyName: '',
                    typology: '',
                    latitude: 0,
                    longitude: 0,
                    primaryLinkCpf: '',
                    primaryLinkName: '',
                    notes: '',
                    documents: []
                  });
                  setEditingCnpj(null);
                  setActiveTab('consult');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: '#181a1b' }}
              >
                {editingCnpj ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CNPJ Details Modal */}
      {selectedCnpj && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Empresa
                </h3>
                <button
                  onClick={() => setSelectedCnpj(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">CNPJ:</span>
                    <p className="text-gray-900">{selectedCnpj.cnpj}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Nome da Empresa:</span>
                    <p className="text-gray-900">{selectedCnpj.companyName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipologia:</span>
                    <p className="text-gray-900">{selectedCnpj.typology}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Localização:</span>
                    <p className="text-gray-900">
                      {selectedCnpj.latitude && selectedCnpj.longitude 
                        ? `${selectedCnpj.latitude}, ${selectedCnpj.longitude}`
                        : 'Não informado'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Primário:</span>
                    <p className="text-gray-900">{selectedCnpj.primaryLinkName || 'Sem vínculo'}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedCnpj.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCnpj(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};