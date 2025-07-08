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
import uploadRouter from './routes/upload';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Super-Logger Middleware - A PRIMEIRA COISA QUE O APP USA
app.use((req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'development') {
    console.log('--- REQUEST RECEIVED BY SPY ---');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log('-----------------------------');
  }
  next(); // Passa a requisição para o próximo middleware (cors, etc.)
});

// Middleware
// Configuração explícita do CORS para garantir que o frontend possa acessar a API
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Permite todas as origens. Para produção, restrinja a domínios específicos.
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
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Master Error Handling Middleware - MUST be the last 'app.use()'
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("!!! MASTER ERROR HANDLER CAUGHT AN ERROR !!!");
  console.error(`Error Message: ${err.message}`);
  if (NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON malformado enviado pelo cliente.' });
  }
  
  res.status(500).json({ message: 'Erro interno inesperado no servidor.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});

export default app;