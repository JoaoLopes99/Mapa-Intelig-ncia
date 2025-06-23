import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import cpfRoutes from './routes/cpfs';
import cnpjRoutes from './routes/cnpjs';
import propertyRoutes from './routes/properties';
import vehicleRoutes from './routes/vehicles';
import phoneRoutes from './routes/phones';
import socialNetworkRoutes from './routes/social-networks';
import financialRoutes from './routes/financials';
import corporateRoutes from './routes/corporates';
import occurrenceRoutes from './routes/occurrences';

const app = express();
const PORT = 3001;

// Super-Logger Middleware - A PRIMEIRA COISA QUE O APP USA
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('--- REQUEST RECEIVED BY SPY ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log('-----------------------------');
  next(); // Passa a requisição para o próximo middleware (cors, etc.)
});

// Middleware
// Configuração explícita do CORS para garantir que o frontend possa acessar a API
app.use(cors({
  origin: '*', // Permite todas as origens. Para produção, restrinja a domínios específicos.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cpfs', cpfRoutes);
app.use('/api/cnpjs', cnpjRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/social-networks', socialNetworkRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/corporates', corporateRoutes);
app.use('/api/occurrences', occurrenceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Master Error Handling Middleware - MUST be the last 'app.use()'
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("!!! MASTER ERROR HANDLER CAUGHT AN ERROR !!!");
  console.error(`Error Message: ${err.message}`);
  console.error(err.stack);
  
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON malformado enviado pelo cliente.' });
  }
  
  res.status(500).json({ message: 'Erro interno inesperado no servidor.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; 