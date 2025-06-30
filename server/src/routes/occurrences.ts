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
      name: occ.name || '',
      type: occ.type,
      communicationType: occ.communicationType || '',
      involved: occ.involved ? JSON.parse(occ.involved) : [],
      unit: occ.unit,
      latitude: occ.latitude,
      longitude: occ.longitude,
      severity: occ.severity,
      startDate: occ.startDate, // Agora usa startDate diretamente
      endDate: occ.endDate || '',
      responsible: occ.responsible,
      status: occ.status,
      observations: occ.observations || '', // Agora usa observations
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
      name,
      type,
      communicationType,
      involved,
      unit, 
      responsible, 
      severity, 
      status, 
      latitude, 
      longitude, 
      observations,
      startDate,
      endDate,
      finalConsiderations,
      documents, 
      createdBy 
    } = req.body;
    
    if (!name || !type || !unit || !responsible || !severity || !status || !startDate) {
      return res.status(400).json({ message: 'Nome, tipo, unidade, responsável, severidade, status e data são obrigatórios' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO occurrences (
        id, name, type, communicationType, involved, unit, responsible, severity, status, 
        latitude, longitude, observations, startDate, endDate, finalConsiderations, 
        documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Date.now().toString(), // ID único
        name,
        type,
        communicationType || '',
        JSON.stringify(involved || []),
        unit,
        responsible,
        severity,
        status,
        latitude,
        longitude,
        observations || '',
        startDate,
        endDate || null,
        finalConsiderations || null,
        JSON.stringify(documents || []),
        createdBy || 'Usuário Desconhecido',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      type,
      communicationType,
      involved,
      unit,
      responsible,
      severity,
      status,
      latitude,
      longitude,
      observations,
      startDate,
      endDate,
      finalConsiderations,
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

// PUT /api/occurrences/:id - Atualizar ocorrência
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      type,
      communicationType,
      involved,
      unit, 
      responsible, 
      severity, 
      status, 
      latitude, 
      longitude, 
      observations,
      startDate,
      endDate,
      finalConsiderations,
      documents 
    } = req.body;
    
    if (!name || !type || !unit || !responsible || !severity || !status || !startDate) {
      return res.status(400).json({ message: 'Nome, tipo, unidade, responsável, severidade, status e data são obrigatórios' });
    }

    const db = await dbPromise;
    await db.run(
      `UPDATE occurrences SET 
        name = ?, type = ?, communicationType = ?, involved = ?, unit = ?, responsible = ?, 
        severity = ?, status = ?, latitude = ?, longitude = ?, observations = ?, 
        startDate = ?, endDate = ?, finalConsiderations = ?, documents = ?, updatedAt = ?
      WHERE id = ?`,
      [
        name,
        type,
        communicationType || '',
        JSON.stringify(involved || []),
        unit,
        responsible,
        severity,
        status,
        latitude,
        longitude,
        observations || '',
        startDate,
        endDate || null,
        finalConsiderations || null,
        JSON.stringify(documents || []),
        new Date().toISOString(),
        id
      ]
    );

    res.json({ message: 'Ocorrência atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/occurrences/:id - Excluir ocorrência
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run('DELETE FROM occurrences WHERE id = ?', [id]);
    res.json({ message: 'Ocorrência excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir ocorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 