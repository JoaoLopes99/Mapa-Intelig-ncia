import React from 'react';

interface PlaceholderModuleProps {
  title: string;
  icon: React.ReactNode;
  description: string;
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({ title, icon, description }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          {icon}
          {title}
        </h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Módulo em Desenvolvimento</h3>
          <p className="text-gray-600 mb-6">
            Este módulo está sendo desenvolvido e será disponibilizado em breve.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Funcionalidades planejadas:</strong>
              <br />• Sistema completo de CRUD
              <br />• Importação e exportação de dados
              <br />• Sistema de vínculos
              <br />• Relatórios em PDF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};