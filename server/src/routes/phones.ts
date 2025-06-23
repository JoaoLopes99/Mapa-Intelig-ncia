import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/phones - Listar todos os telefones
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const phones = await db.all('SELECT * FROM phones');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedPhones = phones.map((phone) => ({
      id: phone.id,
      number: phone.number,
      linkType: phone.type || '', // 'type' do banco vira 'linkType'
      owner: phone.owner || '',
      ownerCpf: phone.ownerCpf || '', // pode não existir na tabela
      primaryLinkCpf: phone.primaryLinkCpf || '',
      primaryLinkName: phone.primaryLinkName || '',
      notes: phone.notes || '',
      documents: phone.documents ? JSON.parse(phone.documents) : [],
      createdBy: phone.createdBy || '',
      createdAt: phone.createdAt || '',
      updatedAt: phone.updatedAt || ''
    }));
    res.json(mappedPhones);
  } catch (error) {
    console.error('Erro ao buscar telefones:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/phones - Criar novo telefone
router.post('/', async (req, res) => {
  console.log('--- PHONE POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      number, 
      linkType, // frontend envia 'linkType'
      owner, 
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!number) {
      return res.status(400).json({ message: 'Número é obrigatório' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO phones (
        id, number, owner, type, primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        number, 
        owner || '', 
        linkType || '', // mapeia 'linkType' para 'type'
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      number,
      linkType,
      owner,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! PHONE CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 