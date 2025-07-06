import { dbPromise } from './database';
import bcrypt from 'bcryptjs';

async function checkDatabase() {
  console.log('Attempting to connect to the database...');
  try {
    const db = await dbPromise;
    console.log('Database connection successful. Fetching users...');
    
    // Attempt to select from a 'users' table, a common convention.
    const users = await db.all('SELECT * FROM users');
    
    console.log('--- Users Table Content ---');
    if (users.length === 0) {
      console.log('The "users" table is empty.');
    } else {
      console.table(users);
    }
    console.log('---------------------------');

  } catch (error: any) {
    console.error('!!! --- DATABASE ERROR --- !!!');
    if (error.message.includes('no such table: users')) {
      console.error('Error: The table "users" was not found.');
      console.error('Please verify the correct table name for user data.');
    } else {
       console.error('An error occurred:', error.message);
    }
    console.error('!!! ---------------------- !!!');
  } finally {
    // dbPromise does not need to be closed manually with the 'sqlite' wrapper
    console.log('Database check finished.');
  }
}

async function checkDatabaseStructure() {
  try {
    const db = await dbPromise;
    
    // Get all table names
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('=== TABELAS NO BANCO DE DADOS ===');
    console.log(tables.map(t => t.name));
    
    // Check structure of each table
    for (const table of tables) {
      const tableName = table.name;
      console.log(`\n=== ESTRUTURA DA TABELA ${tableName.toUpperCase()} ===`);
      const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
      console.log(tableInfo);
      
      // Get sample data
      const sampleData = await db.all(`SELECT * FROM ${tableName} LIMIT 1`);
      console.log(`\n=== DADOS DE EXEMPLO DE ${tableName.toUpperCase()} ===`);
      console.log(sampleData);
    }
    
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
  }
}

async function createAllTables() {
  try {
    const db = await dbPromise;
    
    // Criar tabela users
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela cpfs
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cpfs (
        id TEXT PRIMARY KEY,
        cpf TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        criminalRecord TEXT,
        criminalTypology TEXT,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        photo TEXT,
        documents TEXT,
        connections TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela cnpjs
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cnpjs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        type TEXT,
        latitude REAL DEFAULT 0,
        longitude REAL DEFAULT 0,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela properties
    await db.exec(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        linkType TEXT,
        address TEXT,
        cep TEXT,
        city TEXT,
        state TEXT,
        latitude REAL DEFAULT 0,
        longitude REAL DEFAULT 0,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela vehicles
    await db.exec(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        linkType TEXT,
        plate TEXT,
        brand TEXT,
        model TEXT,
        color TEXT,
        address TEXT,
        cep TEXT,
        city TEXT,
        state TEXT,
        latitude REAL DEFAULT 0,
        longitude REAL DEFAULT 0,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela phones
    await db.exec(`
      CREATE TABLE IF NOT EXISTS phones (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        linkType TEXT,
        owner TEXT,
        ownerCpf TEXT,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela social_networks
    await db.exec(`
      CREATE TABLE IF NOT EXISTS social_networks (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        link TEXT,
        profileName TEXT,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela financials
    await db.exec(`
      CREATE TABLE IF NOT EXISTS financials (
        id TEXT PRIMARY KEY,
        ownerCpf TEXT NOT NULL,
        ownerName TEXT NOT NULL,
        transactionType TEXT,
        bankData TEXT,
        amount REAL,
        fromName TEXT,
        fromCpf TEXT,
        toName TEXT,
        toCpf TEXT,
        primaryLinkCpf TEXT,
        primaryLinkName TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela corporates
    await db.exec(`
      CREATE TABLE IF NOT EXISTS corporates (
        id TEXT PRIMARY KEY,
        involvedCpf TEXT NOT NULL,
        involvedName TEXT NOT NULL,
        raizenLink TEXT,
        sector TEXT,
        startDate TEXT,
        endDate TEXT,
        active TEXT,
        leftDueToOccurrence TEXT,
        notes TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela occurrences
    await db.exec(`
      CREATE TABLE IF NOT EXISTS occurrences (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        communicationType TEXT,
        involved TEXT,
        unit TEXT,
        latitude REAL DEFAULT 0,
        longitude REAL DEFAULT 0,
        severity TEXT,
        startDate TEXT,
        endDate TEXT,
        responsible TEXT,
        status TEXT,
        observations TEXT,
        finalConsiderations TEXT,
        relatedCpfs TEXT,
        documents TEXT,
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
}

async function createUsersTable() {
  try {
    const db = await dbPromise;
    
    // Verificar se já existe um usuário
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', 'admin@raizen.com');
    
    if (!existingUser) {
      // Criar usuário padrão
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Administrador', 'admin@raizen.com', hashedPassword, 'admin']);
      
      console.log('Usuário padrão criado:');
      console.log('Email: admin@raizen.com');
      console.log('Senha: admin123');
    } else {
      console.log('Usuário admin já existe no banco.');
    }
    
  } catch (error) {
    console.error('Erro ao criar usuário padrão:', error);
  }
}

// Executar todas as funções
createAllTables();
createUsersTable();
checkDatabase();
checkDatabaseStructure(); 