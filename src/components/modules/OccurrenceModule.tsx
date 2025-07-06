import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Download, Upload, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import Select from 'react-select';
import { useDataStore } from '../../store/dataStore';
import { Occurrence, CPF } from '../../types';
import { UNITS } from '../../utils/constants';
import { FileUpload } from '../FileUpload';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { createProfessionalPDF, formatArray, formatDate } from '../../utils/pdfUtils';

type TabType = 'consult' | 'register';

export const OccurrenceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOccurrence, setEditingOccurrence] = useState<Occurrence | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  
  const { occurrences, cpfs, addOccurrence, updateOccurrence, deleteOccurrence, fetchOccurrences, fetchCpfs, loading } = useDataStore();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
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
    relatedCpfs: [] as string[],
    documents: [] as any[],
    investigationType: '' as 'SIGS' | 'SIDEF' | 'SITEC' | 'SIMAUT' | ''
  });

  // Carregar dados quando o componente for montado
  useEffect(() => {
    console.log('OccurrenceModule: Carregando dados...');
    fetchOccurrences();
    fetchCpfs();
  }, [fetchOccurrences, fetchCpfs]);

  // Debug: Log quando occurrences mudar
  useEffect(() => {
    console.log('OccurrenceModule: Occurrences carregadas:', occurrences.length, occurrences);
  }, [occurrences]);

  const filteredOccurrences = occurrences.filter(occ => {
    const term = searchTerm.toLowerCase();
    // Safely check each property before calling toLowerCase()
    const nameMatch = occ.name && occ.name.toLowerCase().includes(term);
    const typeMatch = occ.type && occ.type.toLowerCase().includes(term);
    const unitMatch = occ.unit && occ.unit.toLowerCase().includes(term);
    const responsibleMatch = occ.responsible && occ.responsible.toLowerCase().includes(term);
    return nameMatch || typeMatch || unitMatch || responsibleMatch;
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
      name: '',
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
      relatedCpfs: [],
      documents: [],
      investigationType: ''
    });
    setActiveTab('consult');
  };

  const handleEdit = (occurrence: Occurrence) => {
    setFormData({
      name: occurrence.name,
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
      relatedCpfs: occurrence.relatedCpfs || [],
      documents: occurrence.documents,
      investigationType: occurrence.investigationType || ''
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

  // Função para exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Ocorrências', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'Nome',
        'Tipo',
        'Unidade',
        'Gravidade',
        'Status',
        'Responsável',
        'Data Início',
        'Criado por'
      ]],
      body: filteredOccurrences.map(occurrence => [
        occurrence.name,
        occurrence.type,
        occurrence.unit,
        occurrence.severity,
        occurrence.status,
        occurrence.responsible,
        occurrence.startDate,
        occurrence.createdBy || 'N/A'
      ]),
    });
    doc.save('ocorrencias.pdf');
  };

  // Função para exportar PDF individual de uma Ocorrência
  const handleExportOccurrence = (occurrence: Occurrence) => {
    const doc = new jsPDF();
    
    const sections = [
      {
        title: 'INFORMAÇÕES DA OCORRÊNCIA',
        content: [
          { label: 'Nome', value: occurrence.name || 'Não informado' },
          { label: 'Tipo', value: occurrence.type || 'Não informado' },
          { label: 'Tipo de Comunicação', value: occurrence.communicationType || 'Não informado' },
          { label: 'Envolvidos', value: formatArray(occurrence.involved) },
          { label: 'Unidade', value: occurrence.unit || 'Não informado' },
          { label: 'Severidade', value: occurrence.severity || 'Não informado' },
          { label: 'Status', value: occurrence.status || 'Não informado' },
          { label: 'Responsável', value: occurrence.responsible || 'Não informado' }
        ]
      },
      {
        title: 'PERÍODO',
        content: [
          { label: 'Data de Início', value: formatDate(occurrence.startDate) },
          { label: 'Data de Término', value: formatDate(occurrence.endDate) }
        ]
      },
      {
        title: 'LOCALIZAÇÃO',
        content: [
          { label: 'Latitude', value: occurrence.latitude ? occurrence.latitude.toString() : 'Não informado' },
          { label: 'Longitude', value: occurrence.longitude ? occurrence.longitude.toString() : 'Não informado' }
        ]
      },
      {
        title: 'OBSERVAÇÕES',
        content: [
          { label: 'Observações', value: occurrence.observations || 'Nenhuma observação registrada' }
        ]
      },
      {
        title: 'CONSIDERAÇÕES FINAIS',
        content: [
          { label: 'Considerações Finais', value: occurrence.finalConsiderations || 'Nenhuma consideração final registrada' }
        ]
      }
    ];
    
    createProfessionalPDF(doc, 'OCORRÊNCIA', sections, {
      createdBy: occurrence.createdBy || 'Sistema',
      identifier: occurrence.name || 'cadastro'
    });
    
    doc.save(`ocorrencia-${occurrence.name || 'cadastro'}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 text-black mr-2" />
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
                  placeholder="Buscar por nome, tipo, unidade ou responsável..."
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

          {/* Occurrences Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
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
                        {occurrence.name}
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
                          className="text-black hover:text-black"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(occurrence)}
                          className="text-black hover:text-black"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(occurrence.id)}
                          className="text-black hover:text-black"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportOccurrence(occurrence)}
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
            {editingOccurrence ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Forneça os detalhes para criar ou editar uma ocorrência.</p>
          
          <div className="flex justify-end gap-2 mb-6 -mt-16">
            <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              style={{ backgroundColor: '#181a1b' }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </button>
            <a
              href="/modelos/Modelo_Ocorrencia.xlsx"
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da ocorrência"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.investigationType || ''}
                  onChange={e => setFormData(prev => ({ ...prev, investigationType: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="SIGS">SIGS</option>
                  <option value="SIDEF">SIDEF</option>
                  <option value="SITEC">SITEC</option>
                  <option value="SIMAUT">SIMAUT</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Insira informações adicionais, se necessário."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPFs Relacionados
                </label>
                <div className="space-y-2">
                  {formData.relatedCpfs.map((cpf, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Select
                          value={cpf ? { value: cpf, label: `${cpf} - ${cpfs.find(c => c.cpf === cpf)?.name || 'CPF não encontrado'}` } : null}
                          onChange={(option) => {
                            const newCpfs = [...formData.relatedCpfs];
                            newCpfs[index] = option ? option.value : '';
                            setFormData(prev => ({ ...prev, relatedCpfs: newCpfs }));
                          }}
                          options={cpfs
                            .filter(cpfData => !formData.relatedCpfs.includes(cpfData.cpf) || cpfData.cpf === cpf)
                            .map(cpfData => ({
                              value: cpfData.cpf,
                              label: `${cpfData.cpf} - ${cpfData.name}`
                            }))}
                          placeholder="Selecione um CPF..."
                          isClearable
                          isSearchable
                          noOptionsMessage={() => "Nenhum CPF disponível"}
                          className="text-sm"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderColor: '#d1d5db',
                              borderRadius: '0.5rem',
                              minHeight: '42px',
                              '&:hover': {
                                borderColor: '#9ca3af'
                              }
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isSelected ? '#181a1b' : state.isFocused ? '#f3f4f6' : 'white',
                              color: state.isSelected ? 'white' : '#374151',
                              '&:hover': {
                                backgroundColor: state.isSelected ? '#181a1b' : '#f3f4f6'
                              }
                            }),
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999
                            })
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newCpfs = formData.relatedCpfs.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, relatedCpfs: newCpfs }));
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        relatedCpfs: [...prev.relatedCpfs, ''] 
                      }));
                    }}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                  >
                    + Adicionar CPF
                  </button>
                </div>
              </div>
              
              {/* Campo de Anexos */}
              <div className="md:col-span-2">
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
                <FileUpload
                  documents={formData.documents}
                  onDocumentsChange={(documents) => setFormData(prev => ({ ...prev, documents }))}
                  label="Anexos"
                />
              </div>
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
                    name: '',
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
                    relatedCpfs: [],
                    documents: [],
                    investigationType: ''
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
                className="text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: '#181a1b' }}
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

                {selectedOccurrence.relatedCpfs && selectedOccurrence.relatedCpfs.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">CPFs Relacionados:</span>
                    <div className="mt-1 space-y-1">
                      {selectedOccurrence.relatedCpfs.map((cpf, index) => {
                        const cpfData = cpfs.find(c => c.cpf === cpf);
                        return (
                          <p key={index} className="text-gray-900 bg-gray-50 px-2 py-1 rounded">
                            {cpf} - {cpfData ? cpfData.name : 'CPF não encontrado'}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedOccurrence && selectedOccurrence.documents && selectedOccurrence.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Documentos Anexados</h4>
                    <ul className="list-disc pl-5">
                      {selectedOccurrence.documents.map((doc: any, idx: any) => (
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