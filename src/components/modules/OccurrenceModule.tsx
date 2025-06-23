import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Occurrence } from '../../types';
import { UNITS } from '../../utils/constants';

type TabType = 'consult' | 'register';

export const OccurrenceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOccurrence, setEditingOccurrence] = useState<Occurrence | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  
  const { occurrences, cpfs, addOccurrence, updateOccurrence, deleteOccurrence } = useDataStore();

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    communicationType: '',
    involved: [] as string[],
    unit: '',
    latLong: '',
    latitude: 0,
    longitude: 0,
    severity: 'Baixa' as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
    startDate: '',
    endDate: '',
    responsible: '',
    status: 'Em andamento' as 'Em andamento' | 'Finalizada',
    observations: '',
    finalConsiderations: '',
    documents: [] as any[]
  });

  const filteredOccurrences = occurrences.filter(occ => {
    const term = searchTerm.toLowerCase();
    // Safely check each property before calling toLowerCase()
    const typeMatch = occ.type && occ.type.toLowerCase().includes(term);
    const unitMatch = occ.unit && occ.unit.toLowerCase().includes(term);
    const responsibleMatch = occ.responsible && occ.responsible.toLowerCase().includes(term);
    return typeMatch || unitMatch || responsibleMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse lat/long
    const [lat, lng] = formData.latLong.split(',').map(coord => parseFloat(coord.trim()));
    
    const occurrenceData = {
      ...formData,
      latitude: lat || 0,
      longitude: lng || 0,
    };

    if (editingOccurrence) {
      updateOccurrence(editingOccurrence.id, occurrenceData);
      setEditingOccurrence(null);
    } else {
      addOccurrence(occurrenceData);
    }
    
    // Reset form
    setFormData({
      type: '',
      communicationType: '',
      involved: [],
      unit: '',
      latLong: '',
      latitude: 0,
      longitude: 0,
      severity: 'Baixa',
      startDate: '',
      endDate: '',
      responsible: '',
      status: 'Em andamento',
      observations: '',
      finalConsiderations: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (occurrence: Occurrence) => {
    setFormData({
      type: occurrence.type,
      communicationType: occurrence.communicationType,
      involved: occurrence.involved,
      unit: occurrence.unit,
      latLong: `${occurrence.latitude}, ${occurrence.longitude}`,
      latitude: occurrence.latitude,
      longitude: occurrence.longitude,
      severity: occurrence.severity,
      startDate: occurrence.startDate,
      endDate: occurrence.endDate || '',
      responsible: occurrence.responsible,
      status: occurrence.status,
      observations: occurrence.observations,
      finalConsiderations: occurrence.finalConsiderations || '',
      documents: occurrence.documents
    });
    setEditingOccurrence(occurrence);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      deleteOccurrence(id);
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Crítica': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Finalizada' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento de Ocorrências
        </h1>
        <p className="text-gray-600 mt-2">Registro e acompanhamento de ocorrências criminais</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Ocorrências', icon: Search },
            { id: 'register', label: 'Nova Ocorrência', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  placeholder="Buscar por tipo, unidade ou responsável..."
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

          {/* Occurrences Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gravidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {filteredOccurrences.map((occurrence) => (
                    <tr key={occurrence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{occurrence.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {occurrence.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(occurrence.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {occurrence.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {occurrence.responsible}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                          {occurrence.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(occurrence.status)}`}>
                          {occurrence.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {occurrence.createdBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedOccurrence(occurrence)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(occurrence)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(occurrence.id)}
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
            {editingOccurrence ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Forneça os detalhes para criar ou editar uma ocorrência.</p>
          
          <div className="flex justify-end gap-2 mb-6 -mt-16">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ocorrência *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Furto">Furto</option>
                  <option value="Roubo">Roubo</option>
                  <option value="Homicídio">Homicídio</option>
                  <option value="Tráfico">Tráfico</option>
                  <option value="Fraude">Fraude</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Comunicação *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.communicationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, communicationType: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Boletim de Ocorrência">Boletim de Ocorrência</option>
                  <option value="Denúncia Anônima">Denúncia Anônima</option>
                  <option value="Relatório de Investigação">Relatório de Investigação</option>
                  <option value="Ofício">Ofício</option>
                  <option value="Canal de Ética">Canal de Ética</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="col-span-1">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unidade
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Selecione a Unidade</option>
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gravidade *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LAT/LONG *
                </label>
                <input
                  type="text"
                  required
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
                  Data Início *
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
                  Data Fim
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
                  Responsável *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.responsible}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="Em andamento">Em andamento</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Observações sobre a ocorrência..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Considerações Finais
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.finalConsiderations}
                onChange={(e) => setFormData(prev => ({ ...prev, finalConsiderations: e.target.value }))}
                placeholder="Considerações finais sobre a ocorrência..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    type: '',
                    communicationType: '',
                    involved: [],
                    unit: '',
                    latLong: '',
                    latitude: 0,
                    longitude: 0,
                    severity: 'Baixa',
                    startDate: '',
                    endDate: '',
                    responsible: '',
                    status: 'Em andamento',
                    observations: '',
                    finalConsiderations: '',
                    documents: []
                  });
                  setEditingOccurrence(null);
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
                {editingOccurrence ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Occurrence Details Modal */}
      {selectedOccurrence && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Ocorrência #{selectedOccurrence.id}
                </h3>
                <button
                  onClick={() => setSelectedOccurrence(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <p className="text-gray-900">{selectedOccurrence.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Comunicação:</span>
                    <p className="text-gray-900">{selectedOccurrence.communicationType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Unidade:</span>
                    <p className="text-gray-900">{selectedOccurrence.unit}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Responsável:</span>
                    <p className="text-gray-900">{selectedOccurrence.responsible}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gravidade:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedOccurrence.severity)}`}>
                      {selectedOccurrence.severity}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOccurrence.status)}`}>
                      {selectedOccurrence.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedOccurrence.observations}</p>
                </div>
                
                {selectedOccurrence.finalConsiderations && (
                  <div>
                    <span className="font-medium text-gray-700">Considerações Finais:</span>
                    <p className="text-gray-900 mt-1">{selectedOccurrence.finalConsiderations}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOccurrence(null)}
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