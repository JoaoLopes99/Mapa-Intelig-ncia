import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { dbPromise } from '../database';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel são permitidos'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Função para processar dados de CPF
const processCpfData = (rows: any[]) => {
  return rows.map(row => ({
    cpf: row['CPF'] || row['cpf'] || '',
    name: row['Nome'] || row['name'] || '',
    type: row['Tipo de Envolvimento'] || row['Tipo'] || '',
    criminalTypology: row['Tipologia Criminal'] ? row['Tipologia Criminal'].split(',').map((s: string) => s.trim()) : [],
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de CNPJ
const processCnpjData = (rows: any[]) => {
  return rows.map(row => ({
    cnpj: row['CNPJ'] || row['cnpj'] || '',
    companyName: row['Nome da Empresa'] || row['Razão Social'] || '',
    typology: row['Tipologia'] || row['typology'] || '',
    latLong: row['LAT/LONG'] || row['latLong'] || '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de Veículos
const processVehicleData = (rows: any[]) => {
  return rows.map(row => ({
    description: row['Veículo (Descrição)'] || row['Descrição'] || '',
    linkType: row['Tipo de Vínculo'] || row['Vínculo'] || '',
    plate: row['Placa'] || row['plate'] || '',
    brand: row['Marca'] || row['brand'] || '',
    model: row['Modelo'] || row['model'] || '',
    color: row['Cor'] || row['color'] || '',
    address: row['Endereço do Veículo'] || row['Endereço'] || '',
    cep: row['CEP'] || row['cep'] || '',
    city: row['Cidade'] || row['city'] || '',
    state: row['Estado'] || row['state'] || '',
    latLong: row['LAT/LONG'] || row['latLong'] || '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de Imóveis
const processPropertyData = (rows: any[]) => {
  return rows.map(row => ({
    description: row['Imóvel (Descrição)'] || row['Descrição'] || '',
    linkType: row['Tipo de Vínculo'] || row['Vínculo'] || '',
    address: row['Endereço'] || row['address'] || '',
    cep: row['CEP'] || row['cep'] || '',
    city: row['Cidade'] || row['city'] || '',
    state: row['Estado'] || row['state'] || '',
    latLong: row['LAT/LONG'] || row['latLong'] || '',
    latitude: 0,
    longitude: 0,
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de Telefones
const processPhoneData = (rows: any[]) => {
  return rows.map(row => ({
    number: row['Telefone'] || row['number'] || '',
    linkType: row['Tipo de Vínculo'] || row['Vínculo'] || '',
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de Redes Sociais
const processSocialNetworkData = (rows: any[]) => {
  return rows.map(row => ({
    platform: row['Rede Social'] || row['platform'] || '',
    profileName: row['Nome na Rede (Perfil)'] || row['profileName'] || '',
    link: row['Link'] || row['link'] || '',
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados Financeiros
const processFinancialData = (rows: any[]) => {
  return rows.map(row => ({
    ownerCpf: row['CPF do Proprietário'] || row['ownerCpf'] || '',
    ownerName: row['Nome do Proprietário'] || row['ownerName'] || '',
    transactionType: row['Tipo de Transação'] || row['transactionType'] || '',
    bankData: row['Dados Bancários'] || row['bankData'] || '',
    amount: parseFloat(row['Valor da Transação']) || 0,
    fromName: row['Nome Remetente'] || row['fromName'] || '',
    fromCpf: row['CPF Remetente'] || row['fromCpf'] || '',
    toName: row['Nome Destinatário'] || row['toName'] || '',
    toCpf: row['CPF Destinatário'] || row['toCpf'] || '',
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados Empresariais
const processCorporateData = (rows: any[]) => {
  return rows.map(row => ({
    involvedCpf: row['CPF Envolvido'] || row['involvedCpf'] || '',
    involvedName: row['Nome Envolvido'] || row['involvedName'] || '',
    raizenLink: row['Vínculo Raízen'] || row['raizenLink'] || '',
    sector: row['Setor'] || row['sector'] || '',
    startDate: row['Data de Início'] || row['startDate'] || '',
    endDate: row['Data de Fim'] || row['endDate'] || '',
    active: row['Ativo'] || row['active'] || 'N/A',
    leftDueToOccurrence: row['Saída Devido Ocorrência'] || row['leftDueToOccurrence'] || 'N/A',
    primaryLinkCpf: row['Vínculo Primário CPF'] || '',
    primaryLinkName: row['Vínculo Primário Nome'] || '',
    notes: row['Observações'] || row['notes'] || '',
    documents: []
  }));
};

// Função para processar dados de Ocorrências
const processOccurrenceData = (rows: any[]) => {
  return rows.map(row => ({
    type: row['Tipo de Ocorrência'] || row['type'] || '',
    communicationType: row['Tipo de Comunicação'] || row['communicationType'] || '',
    involved: row['Envolvidos'] ? row['Envolvidos'].split(',').map((s: string) => s.trim()) : [],
    unit: row['Unidade'] || row['unit'] || '',
    latLong: row['LAT/LONG'] || row['latLong'] || '',
    latitude: 0,
    longitude: 0,
    severity: row['Gravidade'] || row['severity'] || 'Baixa',
    startDate: row['Data Início'] || row['startDate'] || '',
    endDate: row['Data Fim'] || row['endDate'] || '',
    responsible: row['Responsável'] || row['responsible'] || '',
    status: row['Status'] || row['status'] || 'Em andamento',
    observations: row['Observações'] || row['observations'] || '',
    finalConsiderations: row['Considerações Finais'] || row['finalConsiderations'] || '',
    documents: []
  }));
};

// Rota de upload genérica
router.post('/:type', upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    // Ler o arquivo Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'O arquivo está vazio' });
    }

    let processedData: any[] = [];
    let insertFunction: string = '';

    // Processar dados baseado no tipo
    switch (type) {
      case 'cpf':
        processedData = processCpfData(rows);
        insertFunction = 'addCpf';
        break;
      case 'cnpj':
        processedData = processCnpjData(rows);
        insertFunction = 'addCnpj';
        break;
      case 'vehicle':
        processedData = processVehicleData(rows);
        insertFunction = 'addVehicle';
        break;
      case 'property':
        processedData = processPropertyData(rows);
        insertFunction = 'addProperty';
        break;
      case 'phone':
        processedData = processPhoneData(rows);
        insertFunction = 'addPhone';
        break;
      case 'social-network':
        processedData = processSocialNetworkData(rows);
        insertFunction = 'addSocialNetwork';
        break;
      case 'financial':
        processedData = processFinancialData(rows);
        insertFunction = 'addFinancial';
        break;
      case 'corporate':
        processedData = processCorporateData(rows);
        insertFunction = 'addCorporate';
        break;
      case 'occurrence':
        processedData = processOccurrenceData(rows);
        insertFunction = 'addOccurrence';
        break;
      default:
        return res.status(400).json({ error: 'Tipo de dados não suportado' });
    }

    // Inserir dados no banco
    const results = [];
    const db = await dbPromise;
    
    for (const data of processedData) {
      try {
        let result;
        
        switch (type) {
          case 'cpf':
            result = await db.run(
              `INSERT INTO cpfs (id, cpf, name, type, criminalTypology, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.cpf,
                data.name,
                data.type,
                JSON.stringify(data.criminalTypology),
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'cnpj':
            result = await db.run(
              `INSERT INTO cnpjs (id, cnpj, companyName, typology, latitude, longitude, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.cnpj,
                data.companyName,
                data.typology,
                data.latitude,
                data.longitude,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'vehicle':
            result = await db.run(
              `INSERT INTO vehicles (id, description, linkType, plate, brand, model, color, address, cep, city, state, latitude, longitude, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.description,
                data.linkType,
                data.plate,
                data.brand,
                data.model,
                data.color,
                data.address,
                data.cep,
                data.city,
                data.state,
                data.latitude,
                data.longitude,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'property':
            result = await db.run(
              `INSERT INTO properties (id, description, linkType, address, cep, city, state, latitude, longitude, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.description,
                data.linkType,
                data.address,
                data.cep,
                data.city,
                data.state,
                data.latitude,
                data.longitude,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'phone':
            result = await db.run(
              `INSERT INTO phones (id, number, owner, type, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.number,
                data.owner,
                data.type,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'social-network':
            result = await db.run(
              `INSERT INTO social_networks (id, platform, profileName, link, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.platform,
                data.profileName,
                data.link,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'financial':
            result = await db.run(
              `INSERT INTO financials (id, transactionType, amount, date, description, involvedName, involvedCpf, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.transactionType,
                data.amount,
                new Date().toISOString(),
                data.description,
                data.involvedName,
                data.involvedCpf,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'corporate':
            result = await db.run(
              `INSERT INTO corporates (id, involvedName, involvedCpf, raizenLink, sector, position, startDate, endDate, primaryLinkCpf, primaryLinkName, notes, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                Date.now().toString(),
                data.involvedName,
                data.involvedCpf,
                data.raizenLink,
                data.sector,
                data.position,
                data.startDate,
                data.endDate,
                data.primaryLinkCpf,
                data.primaryLinkName,
                data.notes,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
          case 'occurrence':
            result = await db.run(
              `INSERT INTO occurrences (type, unit, responsible, severity, status, latitude, longitude, description, date, documents, createdBy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                data.type,
                data.unit,
                data.responsible,
                data.severity,
                data.status,
                data.latitude,
                data.longitude,
                data.description,
                data.date,
                JSON.stringify(data.documents),
                'Upload Excel'
              ]
            );
            break;
        }
        
        results.push({ success: true, data: result });
      } catch (error: any) {
        results.push({ success: false, error: error.message, data });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    res.json({
      message: `Upload concluído. ${successCount} registros inseridos com sucesso, ${errorCount} com erro.`,
      total: processedData.length,
      success: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 