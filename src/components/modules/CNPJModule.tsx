import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { CNPJ, FileAttachment } from '../../types';
import { downloadModel, MODEL_FILES } from '../../utils/downloadUtils';
import axios from 'axios';

type TabType = 'consult' | 'register';

export const CNPJModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCnpj, setEditingCnpj] = useState<CNPJ | null>(null);
  const [selectedCnpj, setSelectedCnpj] = useState<CNPJ | null>(null);
  
  const { cnpjs, addCnpj, updateCnpj, deleteCnpj, fetchCnpjs } = useDataStore();
  const { cpfs, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchCnpjs();
    fetchCpfs();
  }, [fetchCnpjs, fetchCpfs]);

  // Função para baixar o modelo CNPJ
  const handleDownloadModel = () => {
    downloadModel(MODEL_FILES.cnpj.file, MODEL_FILES.cnpj.name);
  };

  // Form state
  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    typology: '',
    latLong: '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as FileAttachment[]
  });

  const filteredCnpjs = cnpjs.filter(cnpj =>
    cnpj.cnpj.includes(searchTerm) ||
    cnpj.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cnpj.typology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let lat = 0;
    let lng = 0;
    if (formData.latLong) {
      const coords = formData.latLong.split(',').map(coord => parseFloat(coord.trim()));
      lat = coords[0] || 0;
      lng = coords[1] || 0;
    }
    
    const cnpjData = {
      ...formData,
      latitude: lat,
      longitude: lng,
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
      latLong: '',
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
      latLong: `${cnpj.latitude}, ${cnpj.longitude}`,
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

  const handleLatLongChange = (value: string) => {
    setFormData(prev => {
      const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));
      return {
        ...prev,
        latLong: value,
        latitude: lat || 0,
        longitude: lng || 0
      };
    });
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
      const response = await axios.post('http://192.168.1.12:80/api/upload/cnpj', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data.message || 'Upload realizado com sucesso!');
      fetchCnpjs(); // Atualiza a lista após upload
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
          <Building className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento de CNPJ
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de pessoas jurídicas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar CNPJs', icon: Search },
            { id: 'register', label: 'Novo CNPJ', icon: Plus },
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
                  placeholder="Buscar por CNPJ, nome da empresa ou tipologia..."
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
                  {filteredCnpjs.map((cnpj) => (
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
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(cnpj)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cnpj.id)}
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
            {editingCnpj ? 'Editar CNPJ' : 'Cadastrar Novo CNPJ'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um CNPJ.</p>
          
          <div className="flex justify-end gap-2 mb-6 -mt-16">
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
                  LAT/LONG
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.latLong}
                  onChange={(e) => handleLatLongChange(e.target.value)}
                  placeholder="-23.5505, -46.6333"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.latitude || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.longitude || ''}
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
                placeholder="Observações sobre a empresa..."
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
                  id="document-upload-cnpj"
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
                <label htmlFor="document-upload-cnpj" className="cursor-pointer">
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
                    cnpj: '',
                    companyName: '',
                    typology: '',
                    latLong: '',
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
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

      {uploadResult && (
        <div className={`mt-2 text-sm ${uploadResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{uploadResult}</div>
      )}
    </div>
  );
};