import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/cnpjs - Listar todos os CNPJs
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const cnpjs = await db.all('SELECT * FROM cnpjs');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedCnpjs = cnpjs.map((cnpj) => ({
      id: cnpj.id,
      cnpj: cnpj.cnpj,
      companyName: cnpj.name, // 'name' do banco vira 'companyName'
      typology: cnpj.type, // 'type' do banco vira 'typology'
      latitude: cnpj.latitude,
      longitude: cnpj.longitude,
      primaryLinkCpf: cnpj.primaryLinkCpf,
      primaryLinkName: cnpj.primaryLinkName,
      notes: cnpj.notes,
      documents: cnpj.documents ? JSON.parse(cnpj.documents) : [],
      createdBy: cnpj.createdBy,
      createdAt: cnpj.createdAt || '',
      updatedAt: cnpj.updatedAt || ''
    }));
    res.json(mappedCnpjs);
  } catch (error) {
    console.error('Erro ao buscar CNPJs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cnpjs - Criar novo CNPJ
router.post('/', async (req, res) => {
  console.log('--- CNPJ POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      companyName, // frontend envia 'companyName'
      cnpj, 
      typology, // frontend envia 'typology'
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!companyName || !cnpj) {
      return res.status(400).json({ message: 'Nome da empresa e CNPJ são obrigatórios' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO cnpjs (
        id, name, cnpj, type, primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        companyName, // mapeia 'companyName' para 'name'
        cnpj, 
        typology || '', // mapeia 'typology' para 'type'
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      cnpj,
      companyName,
      typology,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! CNPJ CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 