import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/corporates - Listar todos os registros corporativos
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const corporates = await db.all('SELECT * FROM corporates');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedCorporates = corporates.map((corporate) => ({
      id: corporate.id,
      involvedCpf: corporate.involvedCpf || '',
      involvedName: corporate.involvedName || '',
      raizenLink: corporate.raizenLink || '',
      sector: corporate.sector || '',
      startDate: corporate.startDate || '',
      endDate: corporate.endDate || '',
      active: corporate.active || 'N/A', // pode não existir na tabela
      leftDueToOccurrence: corporate.leftDueToOccurrence || 'N/A', // pode não existir na tabela
      notes: corporate.notes || '',
      documents: corporate.documents ? JSON.parse(corporate.documents) : [],
      createdBy: corporate.createdBy || '',
      createdAt: corporate.createdAt || '',
      updatedAt: corporate.updatedAt || ''
    }));
    res.json(mappedCorporates);
  } catch (error) {
    console.error('Erro ao buscar registros corporativos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/corporates - Criar novo registro corporativo
router.post('/', async (req, res) => {
  console.log('--- CORPORATE POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      involvedCpf, // frontend envia 'involvedCpf'
      involvedName, 
      raizenLink, 
      sector, 
      startDate, 
      endDate, 
      active, // frontend envia 'active'
      leftDueToOccurrence, // frontend envia 'leftDueToOccurrence'
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!involvedName) {
      return res.status(400).json({ message: 'Nome do envolvido é obrigatório' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO corporates (
        id, involvedName, involvedCpf, raizenLink, sector, startDate, endDate, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        involvedName, 
        involvedCpf || '', 
        raizenLink || '', 
        sector || '', 
        startDate || '', 
        endDate || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      involvedCpf,
      involvedName,
      raizenLink,
      sector,
      startDate,
      endDate,
      active,
      leftDueToOccurrence,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! CORPORATE CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 