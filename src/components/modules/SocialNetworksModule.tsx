import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Download, Upload, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { SocialNetwork, FileAttachment } from '../../types';
import { downloadModel, MODEL_FILES } from '../../utils/downloadUtils';
import axios from 'axios';

type TabType = 'consult' | 'register';

export const SocialNetworksModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSocialNetwork, setEditingSocialNetwork] = useState<SocialNetwork | null>(null);
  const [selectedSocialNetwork, setSelectedSocialNetwork] = useState<SocialNetwork | null>(null);
  
  const { socialNetworks, cpfs, addSocialNetwork, updateSocialNetwork, deleteSocialNetwork, fetchSocialNetworks, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchSocialNetworks();
    fetchCpfs();
  }, [fetchSocialNetworks, fetchCpfs]);

  // Form state
  const [formData, setFormData] = useState({
    platform: '',
    link: '',
    profileName: '',
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as FileAttachment[]
  });

  const filteredSocialNetworks = socialNetworks.filter(social =>
    social.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    social.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    social.link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSocialNetwork) {
      updateSocialNetwork(editingSocialNetwork.id, formData);
      setEditingSocialNetwork(null);
    } else {
      addSocialNetwork(formData);
    }
    
    // Reset form
    setFormData({
      platform: '',
      link: '',
      profileName: '',
      primaryLinkCpf: '',
      primaryLinkName: '',
      notes: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (socialNetwork: SocialNetwork) => {
    setFormData({
      platform: socialNetwork.platform,
      link: socialNetwork.link,
      profileName: socialNetwork.profileName,
      primaryLinkCpf: socialNetwork.primaryLinkCpf || '',
      primaryLinkName: socialNetwork.primaryLinkName || '',
      notes: socialNetwork.notes,
      documents: socialNetwork.documents
    });
    setEditingSocialNetwork(socialNetwork);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta rede social?')) {
      deleteSocialNetwork(id);
    }
  };

  const extractProfileName = (url: string, platform: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      switch (platform.toLowerCase()) {
        case 'facebook':
          return pathname.split('/')[1] || '';
        case 'instagram':
          return pathname.replace('/', '').replace('@', '');
        case 'twitter':
        case 'x':
          return pathname.replace('/', '').replace('@', '');
        case 'linkedin':
          const match = pathname.match(/\/in\/([^\/]+)/);
          return match ? match[1] : '';
        default:
          return pathname.split('/').filter(p => p).pop() || '';
      }
    } catch {
      return '';
    }
  };

  const handleLinkChange = (url: string) => {
    setFormData(prev => {
      const profileName = extractProfileName(url, prev.platform);
      return {
        ...prev,
        link: url,
        profileName: profileName || prev.profileName
      };
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter': '🐦',
      'X': '❌',
      'LinkedIn': '💼',
      'TikTok': '🎵',
      'YouTube': '📺',
      'WhatsApp': '💬',
      'Telegram': '✈️',
      'Snapchat': '👻',
      'Discord': '🎮'
    };
    return icons[platform] || '🌐';
  };

  // Função para baixar o modelo Rede Social
  const handleDownloadModel = () => {
    downloadModel(MODEL_FILES.socialNetwork.file, MODEL_FILES.socialNetwork.name);
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
      const response = await axios.post('http://192.168.1.12:80/api/upload/social-network', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data.message || 'Upload realizado com sucesso!');
      fetchSocialNetworks(); // Atualiza a lista após upload
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
          <Users className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento de Redes Sociais
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de redes sociais</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Redes', icon: Search },
            { id: 'register', label: 'Nova Rede', icon: Plus },
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
                  placeholder="Buscar por plataforma, perfil ou link..."
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

          {/* Social Networks Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plataforma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome do Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
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
                  {filteredSocialNetworks.map((socialNetwork) => (
                    <tr key={socialNetwork.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {socialNetwork.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {socialNetwork.profileName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        <a href={socialNetwork.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {socialNetwork.link}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {socialNetwork.primaryLinkName || 'Sem vínculo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {socialNetwork.createdBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(socialNetwork)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(socialNetwork.id)}
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
            {editingSocialNetwork ? 'Editar Rede Social' : 'Cadastrar Nova Rede Social'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar uma rede social.</p>
          
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
                  Rede Social *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter</option>
                  <option value="X">X (antigo Twitter)</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Snapchat">Snapchat</option>
                  <option value="Discord">Discord</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome na Rede (Perfil) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.profileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, profileName: e.target.value }))}
                  placeholder="@usuario ou nome do perfil"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link *
                </label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.link}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="https://www.instagram.com/usuario"
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
                placeholder="Observações sobre a rede social..."
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
                  id="document-upload-social"
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
                <label htmlFor="document-upload-social" className="cursor-pointer">
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
                    platform: '',
                    link: '',
                    profileName: '',
                    primaryLinkCpf: '',
                    primaryLinkName: '',
                    notes: '',
                    documents: []
                  });
                  setEditingSocialNetwork(null);
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
                {editingSocialNetwork ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Social Network Details Modal */}
      {selectedSocialNetwork && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Rede Social
                </h3>
                <button
                  onClick={() => setSelectedSocialNetwork(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Plataforma:</span>
                    <div className="flex items-center mt-1">
                      <span className="text-lg mr-2">{getPlatformIcon(selectedSocialNetwork.platform)}</span>
                      <span className="text-gray-900">{selectedSocialNetwork.platform}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Nome do Perfil:</span>
                    <p className="text-gray-900">{selectedSocialNetwork.profileName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Link:</span>
                    <div className="flex items-center mt-1">
                      <a
                        href={selectedSocialNetwork.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-2 truncate"
                      >
                        {selectedSocialNetwork.link}
                      </a>
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Primário:</span>
                    <p className="text-gray-900">{selectedSocialNetwork.primaryLinkName || 'Sem vínculo'}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedSocialNetwork.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSocialNetwork(null)}
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