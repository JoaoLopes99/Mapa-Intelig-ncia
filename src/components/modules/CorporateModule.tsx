import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Download, Upload, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Corporate, FileAttachment } from '../../types';
import { downloadModel, MODEL_FILES } from '../../utils/downloadUtils';
import { convertFilesToAttachments } from '../../utils/fileUtils';
import axios from 'axios';

type TabType = 'consult' | 'register';

export const CorporateModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCorporate, setEditingCorporate] = useState<Corporate | null>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  
  const { corporates, cpfs, addCorporate, updateCorporate, deleteCorporate, fetchCorporates, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchCorporates();
  }, [fetchCorporates]);

  // Form state
  const [formData, setFormData] = useState({
    involvedCpf: '',
    involvedName: '',
    raizenLink: '',
    sector: '',
    startDate: '',
    endDate: '',
    active: 'SIM' as 'SIM' | 'NÃO' | 'N/A',
    leftDueToOccurrence: 'NÃO' as 'SIM' | 'NÃO' | 'N/A',
    notes: '',
    documents: [] as FileAttachment[]
  });

  // Estado para feedback do upload
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredCorporates = corporates.filter(corporate =>
    (corporate.involvedName && corporate.involvedName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (corporate.sector && corporate.sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (corporate.raizenLink && corporate.raizenLink.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCorporate) {
      updateCorporate(editingCorporate.id, formData);
      setEditingCorporate(null);
    } else {
      addCorporate(formData);
    }
    
    // Reset form
    setFormData({
      involvedCpf: '',
      involvedName: '',
      raizenLink: '',
      sector: '',
      startDate: '',
      endDate: '',
      active: 'SIM',
      leftDueToOccurrence: 'NÃO',
      notes: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (corporate: Corporate) => {
    setFormData({
      involvedCpf: corporate.involvedCpf,
      involvedName: corporate.involvedName,
      raizenLink: corporate.raizenLink,
      sector: corporate.sector,
      startDate: corporate.startDate,
      endDate: corporate.endDate || '',
      active: corporate.active,
      leftDueToOccurrence: corporate.leftDueToOccurrence,
      notes: corporate.notes,
      documents: corporate.documents
    });
    setEditingCorporate(corporate);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vínculo empresarial?')) {
      deleteCorporate(id);
    }
  };

  const calculateServiceTime = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months !== 1 ? 'es' : ''}`;
    }
    return `${months} mês${months !== 1 ? 'es' : ''}`;
  };

  const getStatusColor = (active: string) => {
    switch (active) {
      case 'SIM': return 'bg-green-100 text-green-800';
      case 'NÃO': return 'bg-red-100 text-red-800';
      case 'N/A': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccurrenceColor = (leftDueToOccurrence: string) => {
    switch (leftDueToOccurrence) {
      case 'SIM': return 'bg-red-100 text-red-800';
      case 'NÃO': return 'bg-green-100 text-green-800';
      case 'N/A': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para upload de Excel
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://192.168.1.12:80/api/upload/corporate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data.message || 'Upload realizado com sucesso!');
      fetchCorporates(); // Atualiza a lista após upload
    } catch (error: any) {
      setUploadResult(error.response?.data?.error || 'Erro ao importar arquivo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Briefcase className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento Empresarial
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de vínculos empresariais</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Empresas', icon: Search },
            { id: 'register', label: 'Nova Empresa', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center rounded-t-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-gray-400 bg-gray-300 text-gray-900 shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
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
                  placeholder="Buscar por funcionário, setor ou empresa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* Corporate Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funcionário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo de Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saída por Ocorrência
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
                  {/* Linhas reais */}
                  {filteredCorporates.map((corporate) => {
                    return (
                      <tr key={corporate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{corporate.involvedName || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{corporate.involvedCpf || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {corporate.sector || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <div>
                              <div>{corporate.startDate ? new Date(corporate.startDate).toLocaleDateString('pt-BR') : 'N/A'}</div>
                              {corporate.endDate && (
                                <div className="text-xs">até {new Date(corporate.endDate).toLocaleDateString('pt-BR')}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {corporate.startDate ? calculateServiceTime(corporate.startDate, corporate.endDate) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(corporate.active)}`}>
                            {corporate.active || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccurrenceColor(corporate.leftDueToOccurrence)}`}>
                            {corporate.leftDueToOccurrence || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {corporate.createdBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedCorporate(corporate)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(corporate)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(corporate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-blue-600" />
            {editingCorporate ? 'Editar Vínculo Empresarial' : 'Cadastrar Novo Vínculo Empresarial'}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <p className="text-gray-600">Preencha os dados para {editingCorporate ? 'atualizar o' : 'registrar um novo'} vínculo empresarial.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Upload Excel'}
              </button>
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleExcelUpload}
                className="hidden"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo
              </button>
            </div>
          </div>

          {uploadResult && (
            <div className={`mt-2 text-sm ${uploadResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{uploadResult}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF Envolvido *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.involvedCpf}
                  onChange={(e) => {
                    const selectedCpf = cpfs.find(c => c.cpf === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      involvedCpf: e.target.value,
                      involvedName: selectedCpf?.name || ''
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
                  Nome Envolvido
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.involvedName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vínculo Raízen *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.raizenLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, raizenLink: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Funcionários">Funcionários</option>
                  <option value="Prestadores de Serviço">Prestadores de Serviço</option>
                  <option value="Fornecedor de Cana">Fornecedor de Cana</option>
                  <option value="Fornecedor de Material">Fornecedor de Material</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Terceirizado">Terceirizado</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Jurídico">Jurídico</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ativo *
                </label>
                <div className="flex space-x-4">
                  {['SIM', 'NÃO', 'N/A'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="active"
                        value={option}
                        checked={formData.active === option}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value as any }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saída Devido Ocorrência *
                </label>
                <div className="flex space-x-4">
                  {['SIM', 'NÃO', 'N/A'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="leftDueToOccurrence"
                        value={option}
                        checked={formData.leftDueToOccurrence === option}
                        onChange={(e) => setFormData(prev => ({ ...prev, leftDueToOccurrence: e.target.value as any }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o vínculo empresarial..."
              />
            </div>

            {/* Campo para Anexar Documentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexar Documentos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  className="hidden"
                  id="document-upload-corporate"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData(prev => ({ 
                      ...prev, 
                      documents: [...prev.documents, ...convertFilesToAttachments(files)]
                    }));
                  }}
                />
                <label htmlFor="document-upload-corporate" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para anexar documentos ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, JPG, PNG, XLSX (máx. 10MB cada)
                  </p>
                </label>
              </div>
              {formData.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos anexados:</h4>
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    involvedCpf: '',
                    involvedName: '',
                    raizenLink: '',
                    sector: '',
                    startDate: '',
                    endDate: '',
                    active: 'SIM',
                    leftDueToOccurrence: 'NÃO',
                    notes: '',
                    documents: []
                  });
                  setEditingCorporate(null);
                  setActiveTab('consult');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCorporate ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Corporate Details Modal */}
      {selectedCorporate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes do Vínculo Empresarial
                </h3>
                <button
                  onClick={() => setSelectedCorporate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Funcionário:</span>
                    <p className="text-gray-900">{selectedCorporate.involvedName}</p>
                    <p className="text-gray-500 text-sm">{selectedCorporate.involvedCpf}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Raízen:</span>
                    <p className="text-gray-900">{selectedCorporate.raizenLink}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Setor:</span>
                    <p className="text-gray-900">{selectedCorporate.sector}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Período:</span>
                    <p className="text-gray-900">
                      {new Date(selectedCorporate.startDate).toLocaleDateString('pt-BR')}
                      {selectedCorporate.endDate && (
                        <> até {new Date(selectedCorporate.endDate).toLocaleDateString('pt-BR')}</>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tempo de Serviço:</span>
                    <p className="text-gray-900">
                      {calculateServiceTime(selectedCorporate.startDate, selectedCorporate.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCorporate.active)}`}>
                      {selectedCorporate.active}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Saída por Ocorrência:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccurrenceColor(selectedCorporate.leftDueToOccurrence)}`}>
                      {selectedCorporate.leftDueToOccurrence}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedCorporate.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCorporate(null)}
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