// Função utilitária para download de modelos
export const downloadModel = (modelName: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = `/${modelName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Modelo ${fileName} baixado com sucesso! Abra o arquivo no Excel para preencher os dados.`);
  } catch (error) {
    console.error('Erro ao baixar modelo:', error);
    alert('Erro ao baixar o modelo. Tente novamente.');
  }
};

// Mapeamento de modelos por módulo
export const MODEL_FILES = {
  occurrence: { file: 'Modelo_Ocorrencia.xlsx', name: 'Modelo_Ocorrencia.xlsx' },
  cpf: { file: 'Modelo_CPF.xlsx', name: 'Modelo_CPF.xlsx' },
  cnpj: { file: 'Modelo_CNPJ.xlsx', name: 'Modelo_CNPJ.xlsx' },
  vehicle: { file: 'Modelo_Veiculo.xlsx', name: 'Modelo_Veiculo.xlsx' },
  property: { file: 'Modelo_Imovel.xlsx', name: 'Modelo_Imovel.xlsx' },
  phone: { file: 'Modelo_Telefone.xlsx', name: 'Modelo_Telefone.xlsx' },
  socialNetwork: { file: 'Modelo_Rede_Social.xlsx', name: 'Modelo_Rede_Social.xlsx' },
  financial: { file: 'Modelo_Financeiro.xlsx', name: 'Modelo_Financeiro.xlsx' },
  corporate: { file: 'Modelo_Empresarial.xlsx', name: 'Modelo_Empresarial.xlsx' }
}; 