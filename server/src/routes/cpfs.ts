import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/cpfs - Listar todos os CPFs
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const cpfs = await db.all('SELECT * FROM cpfs'); // Assuming the table is named 'cpfs'
    res.json(cpfs);
  } catch (error) {
    console.error('Erro ao buscar CPFs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cpfs/:id - Buscar CPF específico
router.get('/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const cpf = await db.get('SELECT * FROM cpfs WHERE id = ?', [req.params.id]);
    if (!cpf) {
      return res.status(404).json({ message: 'CPF não encontrado' });
    }
    res.json(cpf);
  } catch (error) {
    console.error('Erro ao buscar CPF:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cpfs - Criar novo CPF
router.post('/', async (req, res) => {
  console.log('--- CPF POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    // Extract all fields that match the database columns
    const { 
      cpf, 
      name, 
      type, 
      criminalRecord, 
      criminalTypology, 
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      photo, 
      documents, 
      createdBy 
    } = req.body;
    
    // Validate required fields
    if (!cpf || !name) {
      return res.status(400).json({ message: 'CPF e nome são obrigatórios' });
    }

    const db = await dbPromise;
    // Use the correct column names from the database
    const result = await db.run(
      `INSERT INTO cpfs (
        id, cpf, name, type, criminalRecord, criminalTypology, 
        primaryLinkCpf, primaryLinkName, notes, photo, documents, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Date.now().toString(), // Generate ID
        cpf, 
        name, 
        type || '', 
        criminalRecord || '', 
        JSON.stringify(criminalTypology || []), 
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        photo || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      cpf,
      name,
      type,
      criminalRecord,
      criminalTypology,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      photo,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! CPF CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/cpfs/:id - Atualizar CPF
router.put('/:id', async (req, res) => {
  console.log('--- CPF PUT ROUTE HIT ---');
  console.log('ID:', req.params.id);
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      cpf, 
      name, 
      type, 
      criminalRecord, 
      criminalTypology, 
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      photo, 
      documents 
    } = req.body;
    
    // Validate required fields
    if (!cpf || !name) {
      return res.status(400).json({ message: 'CPF e nome são obrigatórios' });
    }

    const db = await dbPromise;
    
    // Check if CPF exists
    const existingCpf = await db.get('SELECT * FROM cpfs WHERE id = ?', [req.params.id]);
    if (!existingCpf) {
      return res.status(404).json({ message: 'CPF não encontrado' });
    }

    // Update CPF
    await db.run(
      `UPDATE cpfs SET 
        cpf = ?, name = ?, type = ?, criminalRecord = ?, criminalTypology = ?, 
        primaryLinkCpf = ?, primaryLinkName = ?, notes = ?, photo = ?, documents = ?
      WHERE id = ?`,
      [
        cpf, 
        name, 
        type || '', 
        criminalRecord || '', 
        JSON.stringify(criminalTypology || []), 
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        photo || '', 
        JSON.stringify(documents || []), 
        req.params.id
      ]
    );

    res.json({ 
      id: req.params.id,
      cpf,
      name,
      type,
      criminalRecord,
      criminalTypology,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      photo,
      documents
    });
  } catch (error) {
    console.error('!!! CPF UPDATE DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/cpfs/:id - Deletar CPF
router.delete('/:id', async (req, res) => {
  console.log('--- CPF DELETE ROUTE HIT ---');
  console.log('ID:', req.params.id);
  console.log('--------------------------');

  try {
    const db = await dbPromise;
    
    // Check if CPF exists
    const existingCpf = await db.get('SELECT * FROM cpfs WHERE id = ?', [req.params.id]);
    if (!existingCpf) {
      return res.status(404).json({ message: 'CPF não encontrado' });
    }

    // Delete CPF
    await db.run('DELETE FROM cpfs WHERE id = ?', [req.params.id]);

    res.json({ message: 'CPF deletado com sucesso' });
  } catch (error) {
    console.error('!!! CPF DELETE DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 