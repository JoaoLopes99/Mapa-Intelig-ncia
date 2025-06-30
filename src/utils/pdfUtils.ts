import jsPDF from 'jspdf';

export interface PDFSection {
  title: string;
  content: Array<{ label: string; value: string }>;
}

export const createProfessionalPDF = (
  doc: jsPDF,
  title: string,
  sections: PDFSection[],
  metadata: { createdBy: string; identifier: string }
) => {
  // Função para adicionar cabeçalho em cada página
  const addHeader = (pageNumber: number) => {
    doc.setFillColor(30, 58, 138); // Azul escuro
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SISTEMA DE INTELIGÊNCIA CRIMINAL', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`FICHA INDIVIDUAL - ${title}`, 105, 25, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Número da página
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${pageNumber}`, 190, 20, { align: 'right' });
  };
  
  // Função para adicionar rodapé em cada página
  const addFooter = () => {
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 270, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 280);
    doc.text(`Criado por: ${metadata.createdBy || 'Sistema'}`, 14, 287);
    doc.text('Sistema de Inteligência Criminal - Relatório Individual', 105, 295, { align: 'center' });
  };
  
  // Função para quebrar texto em múltiplas linhas
  const splitTextToSize = (text: string, maxWidth: number) => {
    return doc.splitTextToSize(text, maxWidth);
  };
  
  let currentY = 45;
  let pageNumber = 1;
  
  // Adicionar primeira página
  addHeader(pageNumber);
  
  // Processar cada seção
  sections.forEach((section) => {
    // Verificar se precisa de nova página para o título da seção
    if (currentY > 250) {
      addFooter();
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 45;
    }
    
    // Título da seção
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 14, currentY);
    currentY += 5;
    
    // Linha separadora
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;
    
    // Conteúdo da seção
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    section.content.forEach((item) => {
      // Verificar se precisa de nova página
      if (currentY > 250) {
        addFooter();
        doc.addPage();
        pageNumber++;
        addHeader(pageNumber);
        currentY = 45;
      }
      
      const text = `${item.label}: ${item.value}`;
      
      // Quebrar texto se necessário
      const textLines = splitTextToSize(text, 180);
      textLines.forEach((line: string) => {
        if (currentY > 250) {
          addFooter();
          doc.addPage();
          pageNumber++;
          addHeader(pageNumber);
          currentY = 45;
        }
        doc.text(line, 14, currentY);
        currentY += 8;
      });
      
      currentY += 2; // Espaçamento entre itens
    });
    
    currentY += 10; // Espaçamento entre seções
  });
  
  // Adicionar rodapé na última página
  addFooter();
  
  return doc;
};

export const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

export const formatDate = (date: string | undefined) => {
  if (!date) return 'Não informado';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatArray = (array: any[] | undefined) => {
  if (!array || array.length === 0) return 'Não informado';
  return Array.isArray(array) ? array.join(', ') : array;
}; 