import { Router } from 'express';
import { dbPromise } from '../database';

const router = Router();

// GET /api/social-networks - Listar todas as redes sociais
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    const socialNetworks = await db.all('SELECT * FROM social_networks');
    // Mapear os campos para o formato esperado pelo frontend
    const mappedSocialNetworks = socialNetworks.map((socialNetwork) => ({
      id: socialNetwork.id,
      platform: socialNetwork.platform,
      link: socialNetwork.link,
      profileName: socialNetwork.profileName,
      primaryLinkCpf: socialNetwork.primaryLinkCpf,
      primaryLinkName: socialNetwork.primaryLinkName,
      notes: socialNetwork.notes,
      documents: socialNetwork.documents ? JSON.parse(socialNetwork.documents) : [],
      createdBy: socialNetwork.createdBy,
      createdAt: socialNetwork.createdAt || '',
      updatedAt: socialNetwork.updatedAt || ''
    }));
    res.json(mappedSocialNetworks);
  } catch (error) {
    console.error('Erro ao buscar redes sociais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/social-networks - Criar nova rede social
router.post('/', async (req, res) => {
  console.log('--- SOCIAL NETWORK POST ROUTE HIT ---');
  console.log('Received body:', JSON.stringify(req.body, null, 2));
  console.log('--------------------------');

  try {
    const { 
      platform, 
      profileName, 
      link, 
      primaryLinkCpf, 
      primaryLinkName, 
      notes, 
      documents, 
      createdBy 
    } = req.body;
    
    if (!platform) {
      return res.status(400).json({ message: 'Plataforma é obrigatória' });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO social_networks (
        id, platform, profileName, link, primaryLinkCpf, primaryLinkName, notes, documents, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        Date.now().toString(),
        platform, 
        profileName || '', 
        link || '', 
        primaryLinkCpf || '', 
        primaryLinkName || '', 
        notes || '', 
        JSON.stringify(documents || []), 
        createdBy || 'Usuário Desconhecido'
      ]
    );

    res.status(201).json({ 
      id: result.lastID,
      platform,
      profileName,
      link,
      primaryLinkCpf,
      primaryLinkName,
      notes,
      documents,
      createdBy
    });
  } catch (error) {
    console.error('!!! SOCIAL NETWORK CREATION DATABASE ERROR !!!');
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 