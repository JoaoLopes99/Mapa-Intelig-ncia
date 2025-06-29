import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Vehicle, FileAttachment } from '../../types';
import { downloadModel, MODEL_FILES } from '../../utils/downloadUtils';
import axios from 'axios';

type TabType = 'consult' | 'register';

export const VehiclesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const { vehicles, cpfs, addVehicle, updateVehicle, deleteVehicle, fetchVehicles, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchVehicles();
    fetchCpfs();
  }, [fetchVehicles, fetchCpfs]);

  // Função para baixar o modelo Veículo
  const handleDownloadModel = () => {
    downloadModel(MODEL_FILES.vehicle.file, MODEL_FILES.vehicle.name);
  };

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    linkType: '',
    plate: '',
    brand: '',
    model: '',
    color: '',
    address: '',
    cep: '',
    city: '',
    state: '',
    latLong: '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as FileAttachment[]
  });

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.linkType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse lat/long
    const [lat, lng] = formData.latLong.split(',').map(coord => parseFloat(coord.trim()));
    
    const vehicleData = {
      ...formData,
      latitude: lat || 0,
      longitude: lng || 0,
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
      setEditingVehicle(null);
    } else {
      addVehicle(vehicleData);
    }
    
    // Reset form
    setFormData({
      description: '',
      linkType: '',
      plate: '',
      brand: '',
      model: '',
      color: '',
      address: '',
      cep: '',
      city: '',
      state: '',
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

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      description: vehicle.description,
      linkType: vehicle.linkType,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      address: vehicle.address,
      cep: vehicle.cep,
      city: vehicle.city,
      state: vehicle.state,
      latLong: `${vehicle.latitude}, ${vehicle.longitude}`,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      primaryLinkCpf: vehicle.primaryLinkCpf || '',
      primaryLinkName: vehicle.primaryLinkName || '',
      notes: vehicle.notes,
      documents: vehicle.documents
    });
    setEditingVehicle(vehicle);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteVehicle(id);
    }
  };

  // Função para formatar placa (AAA-1111 ou AAA-1A11)
  const formatPlate = (value: string) => {
    let cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Limita a 7 caracteres
    cleaned = cleaned.slice(0, 7);
    // AAA-1111
    if (/^[A-Z]{3}[0-9]{4}$/.test(cleaned)) {
      return cleaned.replace(/^([A-Z]{3})([0-9]{4})$/, '$1-$2');
    }
    // AAA-1A11
    if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned)) {
      return cleaned.replace(/^([A-Z]{3})([0-9][A-Z][0-9]{2})$/, '$1-$2');
    }
    // Insere hífen após 3 letras se houver mais caracteres
    if (cleaned.length > 3) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    }
    return cleaned;
  };

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
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

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCep(cep);
    setFormData(prev => ({ ...prev, cep: formattedCep }));

    // Simulate CEP lookup (in real app, would call ViaCEP API)
    if (formattedCep.length === 9) {
      // Mock data for demonstration
      setFormData(prev => ({
        ...prev,
        city: 'São Paulo',
        state: 'SP'
      }));
    }
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
      const response = await axios.post('http://192.168.1.12:80/api/upload/vehicle', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data.message || 'Upload realizado com sucesso!');
      fetchVehicles(); // Atualiza a lista após upload
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
          <Car className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento de Veículos
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de veículos</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Veículos', icon: Search },
            { id: 'register', label: 'Novo Veículo', icon: Plus },
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
                  placeholder="Buscar por placa, marca, modelo ou cor..."
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

          {/* Vehicles Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Vínculo
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
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {vehicle.linkType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.primaryLinkName || 'Sem vínculo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.createdBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
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
            {editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um veículo.</p>
          
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

          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            className="hidden"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veículo (Descrição) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Identificação do veículo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vínculo *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.linkType}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkType: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Proprietário e usuário">Proprietário e usuário</option>
                  <option value="Em nome de outros, em uso do envolvido">Em nome de outros, em uso do envolvido</option>
                  <option value="Em nome de outros p/ ocultação B&V">Em nome de outros p/ ocultação B&V</option>
                  <option value="Em seu nome p/ ocultação B&V">Em seu nome p/ ocultação B&V</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.plate}
                  onChange={e => setFormData(prev => ({ ...prev, plate: formatPlate(e.target.value) }))}
                  placeholder="AAA-0000 ou AAA-1A11"
                  maxLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Toyota, Honda, Ford, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Corolla, Civic, Focus, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Branco">Branco</option>
                  <option value="Preto">Preto</option>
                  <option value="Prata">Prata</option>
                  <option value="Cinza">Cinza</option>
                  <option value="Azul">Azul</option>
                  <option value="Vermelho">Vermelho</option>
                  <option value="Verde">Verde</option>
                  <option value="Amarelo">Amarelo</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço do Veículo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Local onde o veículo se encontra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.city}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.state}
                />
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
                placeholder="Observações sobre o veículo..."
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
                  id="document-upload-vehicle"
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
                <label htmlFor="document-upload-vehicle" className="cursor-pointer">
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
                    description: '',
                    linkType: '',
                    plate: '',
                    brand: '',
                    model: '',
                    color: '',
                    address: '',
                    cep: '',
                    city: '',
                    state: '',
                    latLong: '',
                    latitude: 0,
                    longitude: 0,
                    primaryLinkCpf: '',
                    primaryLinkName: '',
                    notes: '',
                    documents: []
                  });
                  setEditingVehicle(null);
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
                {editingVehicle ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes do Veículo
                </h3>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Placa:</span>
                    <p className="text-gray-900">{selectedVehicle.plate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Marca/Modelo:</span>
                    <p className="text-gray-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cor:</span>
                    <p className="text-gray-900">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Vínculo:</span>
                    <p className="text-gray-900">{selectedVehicle.linkType}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Endereço:</span>
                    <p className="text-gray-900">{selectedVehicle.address || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cidade/Estado:</span>
                    <p className="text-gray-900">{selectedVehicle.city}/{selectedVehicle.state}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Primário:</span>
                    <p className="text-gray-900">{selectedVehicle.primaryLinkName || 'Sem vínculo'}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedVehicle.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedVehicle(null)}
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