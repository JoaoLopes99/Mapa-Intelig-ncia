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

export default router; 