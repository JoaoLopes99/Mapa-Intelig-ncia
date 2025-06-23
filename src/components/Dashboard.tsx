import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, User, FileText, TrendingUp, MapPin, Loader2, Calendar, Download } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { CriminalMap } from './CriminalMap';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Dashboard: React.FC = () => {
  const { getDashboardStats, fetchOccurrences, fetchCpfs, loading } = useDataStore();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  useEffect(() => {
    fetchOccurrences();
    fetchCpfs();
  }, [fetchOccurrences, fetchCpfs]);
  
  const stats = getDashboardStats();

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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dashboard PDF
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <Calendar className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <input
              id="start-date"
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="relative">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
            <Calendar className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <input
              id="end-date"
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Ocorrências"
          value={stats.totalOccurrences}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Casos Ativos"
          value={stats.activeCases}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="CPFs Cadastrados"
          value={stats.totalCpfs}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Conexões"
          value={stats.totalConnections}
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
            <BarChart data={stats.occurrencesByType}>
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
                data={stats.occurrencesBySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="severity"
              >
                {stats.occurrencesBySeverity.map((entry, index) => (
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
            <BarChart data={stats.occurrencesByUnit} layout="horizontal">
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
            <BarChart data={stats.occurrencesByResponsible}>
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