import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, Download, Upload, Edit2, Trash2, Eye, MapPin, FileText } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Vehicle } from '../../types';
import { FileUpload } from '../FileUpload';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { createProfessionalPDF, formatArray } from '../../utils/pdfUtils';

type TabType = 'consult' | 'register';

export const VehiclesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const { vehicles, cpfs, addVehicle, updateVehicle, deleteVehicle, fetchVehicles, fetchCpfs, loading } = useDataStore();

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
    documents: [] as any[]
  });

  // Carregar dados quando o componente for montado
  useEffect(() => {
    console.log('VehiclesModule: Carregando dados...');
    fetchVehicles();
    fetchCpfs();
  }, [fetchVehicles, fetchCpfs]);

  // Debug: Log quando vehicles mudar
  useEffect(() => {
    console.log('VehiclesModule: Vehicles carregados:', vehicles.length, vehicles);
  }, [vehicles]);

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

  const formatPlate = (value: string) => {
    let cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Apenas as 3 primeiras letras
    let letters = cleaned.substring(0, 3).replace(/[^A-Z]/g, '');
    // Apenas os 4 últimos números
    let numbers = cleaned.substring(3, 7).replace(/[^0-9]/g, '');
    let result = letters;
    if (letters.length === 3) {
      result += '-';
    }
    result += numbers;
    return result;
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

  // Função para exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Veículos', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'Placa',
        'Marca/Modelo',
        'Cor',
        'Tipo de Vínculo',
        'Vínculo Primário',
        'Criado por'
      ]],
      body: filteredVehicles.map(vehicle => [
        vehicle.plate,
        `${vehicle.brand}/${vehicle.model}`,
        vehicle.color,
        vehicle.linkType,
        vehicle.primaryLinkName || 'N/A',
        vehicle.createdBy || 'N/A'
      ]),
    });
    doc.save('veiculos.pdf');
  };

  // Função para exportar PDF individual de um Veículo
  const handleExportVehicle = (vehicle: Vehicle) => {
    const doc = new jsPDF();
    
    const sections = [
      {
        title: 'INFORMAÇÕES DO VEÍCULO',
        content: [
          { label: 'Descrição', value: vehicle.description || 'Não informado' },
          { label: 'Tipo de Vínculo', value: vehicle.linkType || 'Não informado' },
          { label: 'Placa', value: vehicle.plate || 'Não informado' },
          { label: 'Marca', value: vehicle.brand || 'Não informado' },
          { label: 'Modelo', value: vehicle.model || 'Não informado' },
          { label: 'Cor', value: vehicle.color || 'Não informado' }
        ]
      },
      {
        title: 'ENDEREÇO',
        content: [
          { label: 'Endereço', value: vehicle.address || 'Não informado' },
          { label: 'CEP', value: vehicle.cep || 'Não informado' },
          { label: 'Cidade', value: vehicle.city || 'Não informado' },
          { label: 'Estado', value: vehicle.state || 'Não informado' }
        ]
      },
      {
        title: 'LOCALIZAÇÃO',
        content: [
          { label: 'Latitude', value: vehicle.latitude ? vehicle.latitude.toString() : 'Não informado' },
          { label: 'Longitude', value: vehicle.longitude ? vehicle.longitude.toString() : 'Não informado' }
        ]
      },
      {
        title: 'VÍNCULOS',
        content: [
          { label: 'Vínculo Primário', value: vehicle.primaryLinkName || 'Não informado' },
          { label: 'CPF do Vínculo', value: vehicle.primaryLinkCpf || 'Não informado' }
        ]
      },
      {
        title: 'OBSERVAÇÕES',
        content: [
          { label: 'Observações', value: vehicle.notes || 'Nenhuma observação registrada' }
        ]
      }
    ];
    
    createProfessionalPDF(doc, 'VEÍCULO', sections, {
      createdBy: vehicle.createdBy || 'Sistema',
      identifier: vehicle.plate || 'cadastro'
    });
    
    doc.save(`veiculo-${vehicle.plate || 'cadastro'}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Car className="h-5 w-5 text-black mr-2" />
          Gerenciamento de Veículos
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de veículos</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Veículos', icon: Search },
            { id: 'register', label: 'Cadastrar Veículo', icon: Plus },
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
                  placeholder="Buscar por placa, marca, modelo ou cor..."
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
                          className="text-black hover:text-black"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="text-black hover:text-black"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-black hover:text-black"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportVehicle(vehicle)}
                          className="text-black hover:text-black"
                          title="Exportar PDF"
                        >
                          <FileText className="h-4 w-4" />
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
            <Plus className="h-5 w-5 text-black mr-2" />
            {editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um veículo.</p>
          
          <div className="flex justify-end gap-2 mb-6 -mt-16">
            <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              style={{ backgroundColor: '#181a1b' }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </button>
            <a
              href="/modelos/Modelo_Veículo.xlsx"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, plate: formatPlate(e.target.value) }))}
                  placeholder="AAA-0000"
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
                className="text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: '#181a1b' }}
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
    </div>
  );
};