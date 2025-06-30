import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, User, FileText, TrendingUp, MapPin, Loader2, Calendar, Download, Search } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { CriminalMap } from './CriminalMap';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Dashboard: React.FC = () => {
  const { getDashboardStats, getDashboardStatsByDate, getDashboardStatsByName, fetchOccurrences, fetchCpfs, loading } = useDataStore();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [occurrenceName, setOccurrenceName] = useState<string>('');
  const [filteredStats, setFilteredStats] = useState<any>(null);
  const [filterType, setFilterType] = useState<'none' | 'date' | 'name'>('none');
  
  useEffect(() => {
    fetchOccurrences();
    fetchCpfs();
  }, [fetchOccurrences, fetchCpfs]);
  
  const stats = getDashboardStats();

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      alert('A data de início não pode ser maior que a data de fim.');
      return;
    }

    // Usar a função do store para filtrar por data
    const filteredStats = getDashboardStatsByDate(startDate, endDate);
    setFilteredStats(filteredStats);
    setFilterType('date');
  };

  const handleSearchByName = () => {
    if (!occurrenceName.trim()) {
      alert('Por favor, digite o nome da ocorrência.');
      return;
    }

    // Usar a função do store para filtrar por nome
    const filteredStats = getDashboardStatsByName(occurrenceName.trim());
    setFilteredStats(filteredStats);
    setFilterType('name');
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setOccurrenceName('');
    setFilteredStats(null);
    setFilterType('none');
  };

  // Função para exportar PDF do Dashboard
  const handleExportDashboardPDF = () => {
    const doc = new jsPDF();
    const displayStats = filteredStats || stats;
    
    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório do Dashboard', 14, 20);
    
    // Período do relatório
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (filteredStats && startDate && endDate) {
      doc.text(`Período: ${startDate} até ${endDate}`, 14, 30);
    } else if (filteredStats && occurrenceName) {
      doc.text(`Filtro: Ocorrência "${occurrenceName}"`, 14, 30);
    } else {
      doc.text('Período: Todos os dados', 14, 30);
    }
    
    // Data de geração
    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${currentDate}`, 14, 40);
    
    // Estatísticas gerais
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas Gerais', 14, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Ocorrências: ${displayStats.totalOccurrences}`, 14, 65);
    doc.text(`Casos Ativos: ${displayStats.activeCases}`, 14, 72);
    doc.text(`CPFs Cadastrados: ${displayStats.totalCpfs}`, 14, 79);
    doc.text(`Conexões: ${displayStats.totalConnections}`, 14, 86);
    
    let currentY = 110;
    
    // Ocorrências por Tipo
    if (displayStats.occurrencesByType && displayStats.occurrencesByType.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ocorrências por Tipo', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Tipo', 'Quantidade']],
        body: displayStats.occurrencesByType.map((item: any) => [
          item.type,
          item.count.toString()
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      currentY = 160; // Posição estimada após a primeira tabela
    }
    
    // Ocorrências por Gravidade
    if (displayStats.occurrencesBySeverity && displayStats.occurrencesBySeverity.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ocorrências por Gravidade', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Gravidade', 'Quantidade']],
        body: displayStats.occurrencesBySeverity.map((item: any) => [
          item.severity,
          item.count.toString()
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] }
      });
      
      currentY = 210; // Posição estimada após a segunda tabela
    }
    
    // Ocorrências por Unidade
    if (displayStats.occurrencesByUnit && displayStats.occurrencesByUnit.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ocorrências por Unidade', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Unidade', 'Quantidade']],
        body: displayStats.occurrencesByUnit.map((item: any) => [
          item.unit,
          item.count.toString()
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 158, 11] }
      });
      
      currentY = 260; // Posição estimada após a terceira tabela
    }
    
    // Ocorrências por Responsável
    if (displayStats.occurrencesByResponsible && displayStats.occurrencesByResponsible.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ocorrências por Responsável', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Responsável', 'Quantidade']],
        body: displayStats.occurrencesByResponsible.map((item: any) => [
          item.responsible,
          item.count.toString()
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [239, 68, 68] }
      });
    }
    
    // Rodapé
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sistema de Inteligência Criminal - Relatório Gerado Automaticamente', 14, 280);
    
    // Salvar o PDF
    const fileName = filteredStats && startDate && endDate 
      ? `dashboard-${startDate}-${endDate}.pdf`
      : filteredStats && occurrenceName
      ? `dashboard-ocorrencia-${occurrenceName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      : 'dashboard-completo.pdf';
    doc.save(fileName);
  };

  // Usar estatísticas filtradas se disponível, senão usar as originais
  const displayStats = filteredStats || stats;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading.occurrences || loading.cpfs) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-4 text-lg text-gray-700">Carregando dados do dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de inteligência criminal</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button 
            className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            style={{ backgroundColor: '#181a1b' }}
            onClick={handleExportDashboardPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dashboard PDF
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative md:col-span-4">
            <label htmlFor="occurrence-name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Ocorrência</label>
            <Search className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <input
              id="occurrence-name"
              type="text"
              placeholder="Digite parte do nome da ocorrência"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={occurrenceName}
              onChange={(e) => setOccurrenceName(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearchByName}
              className="w-full text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#181a1b' }}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#181a1b' }}
            >
              Limpar Filtro
            </button>
          </div>
        </div>
        {filteredStats && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtro ativo:</strong> Ocorrência contendo "{occurrenceName}"
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Ocorrências"
          value={displayStats.totalOccurrences}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Casos Ativos"
          value={displayStats.activeCases}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="CPFs Cadastrados"
          value={displayStats.totalCpfs}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Conexões"
          value={displayStats.totalConnections}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occurrences by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayStats.occurrencesByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occurrences by Severity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências por Gravidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayStats.occurrencesBySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="severity"
              >
                {displayStats.occurrencesBySeverity.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occurrences by Unit */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências por Unidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayStats.occurrencesByUnit} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="unit" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occurrences by Responsible */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências por Responsável</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayStats.occurrencesByResponsible}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="responsible" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Criminal Map */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mapa Criminal</h3>
            <p className="text-sm text-gray-600">Localização das ocorrências registradas</p>
          </div>
          <MapPin className="h-6 w-6 text-gray-400" />
        </div>
        <div className="h-96">
          <CriminalMap />
        </div>
      </div>
    </div>
  );
};