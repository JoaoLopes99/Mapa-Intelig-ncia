import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/occurrences - Listar todas as ocorrências
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const occurrences = await db.all('SELECT * FROM occurrences');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedOccurrences = occurrences.map((occ) => ({
      id: occ.id,
      type: occ.type,
      communicationType: occ.communicationType || '',
      involved: occ.involved ? JSON.parse(occ.involved) : [],
      unit: occ.unit,
      latitude: occ.latitude,
      longitude: occ.longitude,
      severity: occ.severity,
      startDate: occ.date, // 'date' do banco vira 'startDate'
      endDate: occ.endDate || '',
      responsible: occ.responsible,
      status: occ.status,
      observations: occ.description || '',
      finalConsiderations: occ.finalConsiderations || '',
      documents: occ.documents ? JSON.parse(occ.documents) : [],
      createdBy: occ.createdBy,
      createdAt: occ.createdAt || '',
      updatedAt: occ.updatedAt || ''
    }));
    res.json(mappedOccurrences);
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/occurrences - Criar nova ocorrência
router.post('/', async (req, res) => {
  console.log('--- OCCURRENCE POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      type, 
      unit, 
      responsible, 
      severity, 
      status, 
      latitude, 
      longitude, 
      observations,
      startDate,
      documents, 
      createdBy 
    } = req.body;
    
    if (!type || !unit || !responsible || !severity || !status || !startDate) {
      return res.status(400).json({ message: 'Tipo, unidade, responsável, severidade, status e data são obrigatórios' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO occurrences (
        type, unit, responsible, severity, status, latitude, longitude, description, date, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        unit,
        responsible,
        severity,
        status,
        latitude,
        longitude,
        observations || '',
        startDate,
        JSON.stringify(documents || []),
        createdBy || 'Usuário Desconhecido',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    res.status(201).json({
      id: result.lastID,
      type,
      unit,
      responsible,
      severity,
      status,
      latitude,
      longitude,
      description: observations || '',
      date: startDate,
      documents,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('!!! OCCURRENCE CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 