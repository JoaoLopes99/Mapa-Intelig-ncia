import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Download, Upload, Edit2, Trash2, FileImage } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { CPF, FileAttachment, Connection } from '../../types';
import { downloadModel, MODEL_FILES } from '../../utils/downloadUtils';
import axios from 'axios';

type TabType = 'consult' | 'register';

export const CPFModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCpf, setEditingCpf] = useState<CPF | null>(null);
  const { cpfs, addCpf, updateCpf, deleteCpf, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchCpfs();
  }, [fetchCpfs]);

  // Função para baixar o modelo CPF
  const handleDownloadModel = () => {
    downloadModel(MODEL_FILES.cpf.file, MODEL_FILES.cpf.name);
  };

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
    documents: [] as FileAttachment[],
    connections: [] as Connection[]
  });

  const filteredCpfs = cpfs.filter(cpf => {
    const term = searchTerm.toLowerCase();
    const cpfMatch = cpf.cpf && cpf.cpf.toLowerCase().includes(term);
    const nameMatch = cpf.name && cpf.name.toLowerCase().includes(term);
    const typeMatch = cpf.type && cpf.type.toLowerCase().includes(term);
    return cpfMatch || nameMatch || typeMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCpf) {
      updateCpf(editingCpf.id, formData);
      setEditingCpf(null);
    } else {
      addCpf(formData);
    }
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
    setFormData({
      cpf: cpf.cpf,
      name: cpf.name,
      type: cpf.type,
      criminalRecord: cpf.criminalRecord,
      criminalTypology: cpf.criminalTypology,
      primaryLinkCpf: cpf.primaryLinkCpf || '',
      primaryLinkName: cpf.primaryLinkName || '',
      notes: cpf.notes,
      photo: cpf.photo || '',
      documents: cpf.documents || [],
      connections: cpf.connections || []
    });
    setEditingCpf(cpf);
    setActiveTab('register');
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

  // Estado para feedback do upload
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Função para upload de Excel
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://192.168.1.12:80/api/upload/cpf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data.message || 'Upload realizado com sucesso!');
      fetchCpfs(); // Atualiza a lista após upload
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
          <User className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento de CPF
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de pessoas físicas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar CPFs', icon: Search },
            { id: 'register', label: 'Novo CPF', icon: Plus },
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
                  placeholder="Buscar por CPF, nome ou tipo..."
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
                  {filteredCpfs.map((cpf) => (
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
                          onClick={() => handleEdit(cpf)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cpf.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-blue-600" />
            {editingCpf ? 'Editar CPF' : 'Cadastrar Novo CPF'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um CPF.</p>

          <div className="flex justify-end gap-2 mb-6 -mt-24">
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
              <button 
                onClick={handleDownloadModel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo
              </button>
          </div>

          {uploadResult && (
            <div className={`mt-2 text-sm ${uploadResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{uploadResult}</div>
          )}

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
                  value={formData.criminalTypology.join(', ')}
                  onChange={(e) => setFormData(prev => ({ ...prev, criminalTypology: e.target.value.split(',').map(s => s.trim()) }))}
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
            </div>
            
            {/* Campo para Anexar Documentos */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexar Documentos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  className="hidden"
                  id="document-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData(prev => ({ 
                      ...prev, 
                      documents: [
                        ...prev.documents, 
                        ...files.map(f => ({
                          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                          name: f.name,
                          type: f.type,
                          size: f.size,
                          url: URL.createObjectURL(f),
                          uploadedAt: new Date().toISOString()
                        } as FileAttachment))
                      ]
                    }));
                  }}
                />
                <label htmlFor="document-upload" className="cursor-pointer">
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCpf ? 'Salvar Alterações' : 'Salvar CPF'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};