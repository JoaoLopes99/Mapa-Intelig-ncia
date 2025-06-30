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
      latitude: cnpj.latitude || 0,
      longitude: cnpj.longitude || 0,
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

// GET /api/cnpjs/:id - Buscar CNPJ específico
router.get('/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const cnpj = await db.get('SELECT * FROM cnpjs WHERE id = ?', [req.params.id]);
    if (!cnpj) {
      return res.status(404).json({ message: 'CNPJ não encontrado' });
    }
    
    // Mapear para o formato do frontend
    const mappedCnpj = {
      id: cnpj.id,
      cnpj: cnpj.cnpj,
      companyName: cnpj.name,
      typology: cnpj.type,
      latitude: cnpj.latitude || 0,
      longitude: cnpj.longitude || 0,
      primaryLinkCpf: cnpj.primaryLinkCpf,
      primaryLinkName: cnpj.primaryLinkName,
      notes: cnpj.notes,
      documents: cnpj.documents ? JSON.parse(cnpj.documents) : [],
      createdBy: cnpj.createdBy,
      createdAt: cnpj.createdAt || '',
      updatedAt: cnpj.updatedAt || ''
    };
    
    res.json(mappedCnpj);
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
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
      latitude,
      longitude,
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
        id, name, cnpj, type, latitude, longitude, primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        companyName, // mapeia 'companyName' para 'name'
        cnpj, 
        typology || '', // mapeia 'typology' para 'type'
        latitude || 0,
        longitude || 0,
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    // Retornar o CNPJ criado no formato do frontend
    const createdCnpj = {
      id: result.lastID,
      cnpj,
      companyName,
      typology,
      latitude: latitude || 0,
      longitude: longitude || 0,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    };

    res.status(201).json(createdCnpj);
  } catch (error) {
    console.error('!!! CNPJ CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/cnpjs/:id - Atualizar CNPJ
router.put('/:id', async (req, res) => {
  console.log('--- CNPJ PUT ROUTE HIT ---');
  console.log('ID:', req.params.id);
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      companyName,
      cnpj, 
      typology,
      latitude,
      longitude,
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents 
    } = req.body;
    
    if (!companyName || !cnpj) {
      return res.status(400).json({ message: 'Nome da empresa e CNPJ são obrigatórios' });
    }

    const db = await dbPromise;
    
    // Check if CNPJ exists
    const existingCnpj = await db.get('SELECT * FROM cnpjs WHERE id = ?', [req.params.id]);
    if (!existingCnpj) {
      return res.status(404).json({ message: 'CNPJ não encontrado' });
    }

    // Update CNPJ
    await db.run(
      `UPDATE cnpjs SET 
        name = ?, cnpj = ?, type = ?, latitude = ?, longitude = ?, 
        primaryLinkCpf = ?, primaryLinkName = ?, notes = ?, documents = ?, updatedAt = datetime('now')
      WHERE id = ?`,
      [
        companyName,
        cnpj, 
        typology || '', 
        latitude || 0,
        longitude || 0,
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        req.params.id
      ]
    );

    // Retornar o CNPJ atualizado no formato do frontend
    const updatedCnpj = {
      id: req.params.id,
      cnpj,
      companyName,
      typology,
      latitude: latitude || 0,
      longitude: longitude || 0,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents
    };

    res.json(updatedCnpj);
  } catch (error) {
    console.error('!!! CNPJ UPDATE DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/cnpjs/:id - Deletar CNPJ
router.delete('/:id', async (req, res) => {
  console.log('--- CNPJ DELETE ROUTE HIT ---');
  console.log('ID:', req.params.id);
  console.log('--------------------------');

  try {
    const db = await dbPromise;
    
    // Check if CNPJ exists
    const existingCnpj = await db.get('SELECT * FROM cnpjs WHERE id = ?', [req.params.id]);
    if (!existingCnpj) {
      return res.status(404).json({ message: 'CNPJ não encontrado' });
    }

    // Delete CNPJ
    await db.run('DELETE FROM cnpjs WHERE id = ?', [req.params.id]);

    res.json({ message: 'CNPJ deletado com sucesso' });
  } catch (error) {
    console.error('!!! CNPJ DELETE DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 