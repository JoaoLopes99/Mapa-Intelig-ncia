import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/financials - Listar todas as transações financeiras
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const financials = await db.all('SELECT * FROM financials');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedFinancials = financials.map((financial) => ({
      id: financial.id,
      ownerCpf: financial.involvedCpf, // 'involvedCpf' do banco vira 'ownerCpf'
      ownerName: financial.involvedName, // 'involvedName' do banco vira 'ownerName'
      transactionType: financial.transactionType,
      bankData: financial.description, // 'description' do banco vira 'bankData'
      amount: financial.amount,
      fromName: financial.involvedName, // reutiliza 'involvedName' para 'fromName'
      fromCpf: financial.involvedCpf, // reutiliza 'involvedCpf' para 'fromCpf'
      toName: financial.involvedName, // reutiliza 'involvedName' para 'toName'
      toCpf: financial.involvedCpf, // reutiliza 'involvedCpf' para 'toCpf'
      primaryLinkCpf: financial.primaryLinkCpf,
      primaryLinkName: financial.primaryLinkName,
      notes: financial.notes,
      documents: financial.documents ? JSON.parse(financial.documents) : [],
      createdBy: financial.createdBy,
      createdAt: financial.createdAt || '',
      updatedAt: financial.updatedAt || ''
    }));
    res.json(mappedFinancials);
  } catch (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/financials - Criar nova transação financeira
router.post('/', async (req, res) => {
  console.log('--- FINANCIAL POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      ownerCpf, // frontend envia 'ownerCpf'
      ownerName, // frontend envia 'ownerName'
      transactionType, 
      bankData, // frontend envia 'bankData'
      amount, 
      fromName, // frontend envia 'fromName'
      fromCpf, // frontend envia 'fromCpf'
      toName, // frontend envia 'toName'
      toCpf, // frontend envia 'toCpf'
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!transactionType || !amount || !ownerCpf || !ownerName) {
      return res.status(400).json({ message: 'Tipo de transação, valor, CPF e nome do proprietário são obrigatórios' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO financials (
        id, transactionType, amount, date, description, involvedName, involvedCpf,
        primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        transactionType, 
        amount, 
        new Date().toISOString(), // usa data atual
        bankData || '', // mapeia 'bankData' para 'description'
        ownerName, // mapeia 'ownerName' para 'involvedName'
        ownerCpf, // mapeia 'ownerCpf' para 'involvedCpf'
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      ownerCpf,
      ownerName,
      transactionType,
      bankData,
      amount,
      fromName,
      fromCpf,
      toName,
      toCpf,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! FINANCIAL CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 