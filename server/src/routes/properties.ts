import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/properties - Listar todas as propriedades
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const properties = await db.all('SELECT * FROM properties');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedProperties = properties.map((property) => ({
      id: property.id,
      description: property.description,
      linkType: property.linkType,
      address: property.address,
      cep: property.cep,
      city: property.city,
      state: property.state,
      latitude: property.latitude,
      longitude: property.longitude,
      primaryLinkCpf: property.primaryLinkCpf,
      primaryLinkName: property.primaryLinkName,
      notes: property.notes,
      documents: property.documents ? JSON.parse(property.documents) : [],
      createdBy: property.createdBy,
      createdAt: property.createdAt || '',
      updatedAt: property.updatedAt || ''
    }));
    res.json(mappedProperties);
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/properties - Criar nova propriedade
router.post('/', async (req, res) => {
  console.log('--- PROPERTY POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      description, 
      linkType, 
      address, 
      cep, 
      city, 
      state, 
      latitude, 
      longitude, 
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Descrição é obrigatória' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO properties (
        id, description, linkType, address, cep, city, state, latitude, longitude,
        primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        description, 
        linkType || '', 
        address || '', 
        cep || '', 
        city || '', 
        state || '', 
        latitude || 0, 
        longitude || 0, 
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      description,
      linkType,
      address,
      cep,
      city,
      state,
      latitude,
      longitude,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! PROPERTY CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 