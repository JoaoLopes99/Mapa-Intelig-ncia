import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/vehicles - Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const vehicles = await db.all('SELECT * FROM vehicles');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      description: vehicle.description,
      linkType: vehicle.linkType,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      address: vehicle.address,
      cep: vehicle.cep,
      city: vehicle.city,
      state: vehicle.state,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      primaryLinkCpf: vehicle.primaryLinkCpf,
      primaryLinkName: vehicle.primaryLinkName,
      notes: vehicle.notes,
      documents: vehicle.documents ? JSON.parse(vehicle.documents) : [],
      createdBy: vehicle.createdBy,
      createdAt: vehicle.createdAt || '',
      updatedAt: vehicle.updatedAt || ''
    }));
    res.json(mappedVehicles);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/vehicles - Criar novo veículo
router.post('/', async (req, res) => {
  console.log('--- VEHICLE POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      description, 
      linkType, 
      plate, 
      brand, 
      model, 
      color, 
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
      `INSERT INTO vehicles (
        id, description, linkType, plate, brand, model, color, address, cep, city, state,
        latitude, longitude, primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        description, 
        linkType || '', 
        plate || '', 
        brand || '', 
        model || '', 
        color || '', 
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
      plate,
      brand,
      model,
      color,
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
    console.error('!!! VEHICLE CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 