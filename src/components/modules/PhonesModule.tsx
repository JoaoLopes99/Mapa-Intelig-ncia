import React, { useState, useEffect } from 'react';
import { Phone, Plus, Search, Download, Upload, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Phone as PhoneType } from '../../types';
import { FileUpload } from '../FileUpload';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { createProfessionalPDF, formatArray } from '../../utils/pdfUtils';

type TabType = 'consult' | 'register';

export const PhonesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPhone, setEditingPhone] = useState<PhoneType | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<PhoneType | null>(null);
  
  const { phones, cpfs, addPhone, updatePhone, deletePhone, fetchPhones, fetchCpfs } = useDataStore();

  // Carregar dados quando o componente é montado
  useEffect(() => {
    fetchPhones();
    fetchCpfs();
  }, [fetchPhones, fetchCpfs]);

  // Form state
  const [formData, setFormData] = useState({
    number: '',
    linkType: '',
    owner: '',
    ownerCpf: '',
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as any[]
  });

  const filteredPhones = phones.filter(phone =>
    (phone.number && phone.number.includes(searchTerm)) ||
    (phone.owner && phone.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (phone.linkType && phone.linkType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPhone) {
      updatePhone(editingPhone.id, formData);
      setEditingPhone(null);
    } else {
      addPhone(formData);
    }
    
    // Reset form
    setFormData({
      number: '',
      linkType: '',
      owner: '',
      ownerCpf: '',
      primaryLinkCpf: '',
      primaryLinkName: '',
      notes: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (phone: PhoneType) => {
    setFormData({
      number: phone.number,
      linkType: phone.linkType,
      owner: phone.owner,
      ownerCpf: phone.ownerCpf || '',
      primaryLinkCpf: phone.primaryLinkCpf || '',
      primaryLinkName: phone.primaryLinkName || '',
      notes: phone.notes,
      documents: phone.documents
    });
    setEditingPhone(phone);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este telefone?')) {
      deletePhone(id);
    }
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      // Landline: (11) 1234-5678
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Mobile: (11) 91234-5678
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Função para exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Telefones', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'Número',
        'Tipo de Vínculo',
        'Proprietário',
        'Vínculo Primário',
        'Criado por'
      ]],
      body: filteredPhones.map(phone => [
        phone.number || 'N/A',
        phone.linkType || 'N/A',
        phone.owner || 'N/A',
        phone.primaryLinkName || 'N/A',
        phone.createdBy || 'N/A'
      ]),
    });
    doc.save('telefones.pdf');
  };

  // Função para exportar PDF individual de um Telefone
  const handleExportPhone = (phone: PhoneType) => {
    const doc = new jsPDF();
    
    const sections = [
      {
        title: 'INFORMAÇÕES DO TELEFONE',
        content: [
          { label: 'Número', value: phone.number || 'Não informado' },
          { label: 'Tipo de Vínculo', value: phone.linkType || 'Não informado' },
          { label: 'Proprietário', value: phone.owner || 'Não informado' },
          { label: 'CPF do Proprietário', value: phone.ownerCpf || 'Não informado' }
        ]
      },
      {
        title: 'VÍNCULOS',
        content: [
          { label: 'Vínculo Primário', value: phone.primaryLinkName || 'Não informado' },
          { label: 'CPF do Vínculo', value: phone.primaryLinkCpf || 'Não informado' }
        ]
      },
      {
        title: 'OBSERVAÇÕES',
        content: [
          { label: 'Observações', value: phone.notes || 'Nenhuma observação registrada' }
        ]
      }
    ];
    
    createProfessionalPDF(doc, 'TELEFONE', sections, {
      createdBy: phone.createdBy || 'Sistema',
      identifier: phone.number || 'cadastro'
    });
    
    doc.save(`telefone-${phone.number || 'cadastro'}.pdf`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Phone className="h-5 w-5 text-black mr-2" />
          Gerenciamento de Telefones
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de telefones</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Telefones', icon: Search },
            { id: 'register', label: 'Cadastrar Telefone', icon: Plus },
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
                  placeholder="Buscar por número, proprietário ou tipo de vínculo..."
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

          {/* Phones Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Vínculo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proprietário
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
                  {/* Linhas reais */}
                  {filteredPhones.map((phone) => {
                    return (
                      <tr key={phone.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {phone.number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {phone.linkType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {phone.owner || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {phone.primaryLinkName || 'Sem vínculo'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {phone.createdBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedPhone(phone)}
                            className="text-black hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(phone)}
                            className="text-black hover:text-black"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(phone.id)}
                            className="text-black hover:text-black"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportPhone(phone)}
                            className="text-black hover:text-black"
                            title="Exportar PDF"
                          >
                            <FileText className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Plus className="h-5 w-5 text-black mr-2" />
            {editingPhone ? 'Editar Telefone' : 'Cadastrar Novo Telefone'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar um telefone.</p>

          <div className="flex justify-end gap-2 mb-6 -mt-16">
            <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              style={{ backgroundColor: '#181a1b' }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </button>
            <a
              href="/modelos/Modelo_Telefone.xlsx"
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
                  Telefone *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: formatPhone(e.target.value) }))}
                  placeholder="(11) 91234-5678"
                  maxLength={15}
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
                  <option value="Proprietário">Proprietário</option>
                  <option value="Em seu uso em nome de outros">Em seu uso em nome de outros</option>
                  <option value="Contato do envolvido">Contato do envolvido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proprietário da Linha *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="Nome do proprietário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Proprietário
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.ownerCpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerCpf: e.target.value }))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    number: '',
                    linkType: '',
                    owner: '',
                    ownerCpf: '',
                    primaryLinkCpf: '',
                    primaryLinkName: '',
                    notes: '',
                    documents: []
                  });
                  setEditingPhone(null);
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
                {editingPhone ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Phone Details Modal */}
      {selectedPhone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes do Telefone
                </h3>
                <button
                  onClick={() => setSelectedPhone(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Telefone:</span>
                    <p className="text-gray-900">{selectedPhone.number}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Vínculo:</span>
                    <p className="text-gray-900">{selectedPhone.linkType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Proprietário:</span>
                    <p className="text-gray-900">{selectedPhone.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CPF do Proprietário:</span>
                    <p className="text-gray-900">{selectedPhone.ownerCpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Primário:</span>
                    <p className="text-gray-900">{selectedPhone.primaryLinkName || 'Sem vínculo'}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedPhone.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPhone(null)}
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