import React, { useState } from 'react';
import { DollarSign, Plus, Search, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Financial } from '../../types';

type TabType = 'consult' | 'register';

export const FinancialModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('consult');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFinancial, setEditingFinancial] = useState<Financial | null>(null);
  const [selectedFinancial, setSelectedFinancial] = useState<Financial | null>(null);
  
  const { financials, cpfs, addFinancial, updateFinancial, deleteFinancial } = useDataStore();

  // Form state
  const [formData, setFormData] = useState({
    ownerCpf: '',
    ownerName: '',
    transactionType: '',
    bankData: '',
    amount: 0,
    fromName: '',
    fromCpf: '',
    toName: '',
    toCpf: '',
    primaryLinkCpf: '',
    primaryLinkName: '',
    notes: '',
    documents: [] as any[]
  });

  const filteredFinancials = financials.filter(financial =>
    financial.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    financial.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    financial.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    financial.toName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFinancial) {
      updateFinancial(editingFinancial.id, formData);
      setEditingFinancial(null);
    } else {
      addFinancial(formData);
    }
    
    // Reset form
    setFormData({
      ownerCpf: '',
      ownerName: '',
      transactionType: '',
      bankData: '',
      amount: 0,
      fromName: '',
      fromCpf: '',
      toName: '',
      toCpf: '',
      primaryLinkCpf: '',
      primaryLinkName: '',
      notes: '',
      documents: []
    });
    setActiveTab('consult');
  };

  const handleEdit = (financial: Financial) => {
    setFormData({
      ownerCpf: financial.ownerCpf,
      ownerName: financial.ownerName,
      transactionType: financial.transactionType,
      bankData: financial.bankData,
      amount: financial.amount,
      fromName: financial.fromName,
      fromCpf: financial.fromCpf || '',
      toName: financial.toName,
      toCpf: financial.toCpf || '',
      primaryLinkCpf: financial.primaryLinkCpf || '',
      primaryLinkName: financial.primaryLinkName || '',
      notes: financial.notes,
      documents: financial.documents
    });
    setEditingFinancial(financial);
    setActiveTab('register');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação financeira?')) {
      deleteFinancial(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <DollarSign className="h-8 w-8 mr-3 text-blue-600" />
          Gerenciamento Financeiro
        </h1>
        <p className="text-gray-600 mt-2">Cadastro e consulta de transações financeiras</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'consult', label: 'Consultar Transações', icon: Search },
            { id: 'register', label: 'Cadastrar Transação', icon: Plus },
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
                  placeholder="Buscar por proprietário, tipo de transação ou envolvidos..."
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

          {/* Financial Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Envolvido
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
                  {filteredFinancials.map((financial) => (
                    <tr key={financial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {financial.transactionType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {financial.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(financial.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {financial.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {financial.primaryLinkName || 'Sem vínculo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {financial.createdBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(financial)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(financial.id)}
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
            {editingFinancial ? 'Editar Transação' : 'Cadastrar Nova Transação'}
          </h2>
          <p className="text-gray-600 mb-6 ml-9">Preencha os dados para criar ou editar uma transação financeira.</p>

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
                  CPF do Proprietário *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.ownerCpf}
                  onChange={(e) => {
                    const selectedCpf = cpfs.find(c => c.cpf === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      ownerCpf: e.target.value,
                      ownerName: selectedCpf?.name || ''
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
                  Nome do Proprietário
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.ownerName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transação *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.transactionType}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionType: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="DOC">DOC</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Depósito">Depósito</option>
                  <option value="Saque">Saque</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Transação *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dados Bancários
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.bankData}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankData: e.target.value }))}
                  placeholder="Banco, agência, conta, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  De (Nome) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.fromName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Nome do remetente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  De (CPF)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.fromCpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromCpf: e.target.value }))}
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
                  Para (Nome) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.toName}
                  onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
                  placeholder="Nome do destinatário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para (CPF)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.toCpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, toCpf: e.target.value }))}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campo Texto / Observações
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a transação..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ownerCpf: '',
                    ownerName: '',
                    transactionType: '',
                    bankData: '',
                    amount: 0,
                    fromName: '',
                    fromCpf: '',
                    toName: '',
                    toCpf: '',
                    primaryLinkCpf: '',
                    primaryLinkName: '',
                    notes: '',
                    documents: []
                  });
                  setEditingFinancial(null);
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
                {editingFinancial ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Financial Details Modal */}
      {selectedFinancial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Transação Financeira
                </h3>
                <button
                  onClick={() => setSelectedFinancial(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Proprietário:</span>
                    <p className="text-gray-900">{selectedFinancial.ownerName}</p>
                    <p className="text-gray-500 text-sm">{selectedFinancial.ownerCpf}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Transação:</span>
                    <p className="text-gray-900">{selectedFinancial.transactionType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Valor:</span>
                    <p className="text-gray-900 font-bold text-lg">{formatCurrency(selectedFinancial.amount)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dados Bancários:</span>
                    <p className="text-gray-900">{selectedFinancial.bankData || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">De:</span>
                    <p className="text-gray-900">{selectedFinancial.fromName}</p>
                    {selectedFinancial.fromCpf && (
                      <p className="text-gray-500 text-sm">{selectedFinancial.fromCpf}</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Para:</span>
                    <p className="text-gray-900">{selectedFinancial.toName}</p>
                    {selectedFinancial.toCpf && (
                      <p className="text-gray-500 text-sm">{selectedFinancial.toCpf}</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vínculo Primário:</span>
                    <p className="text-gray-900">{selectedFinancial.primaryLinkName || 'Sem vínculo'}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Observações:</span>
                  <p className="text-gray-900 mt-1">{selectedFinancial.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedFinancial(null)}
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