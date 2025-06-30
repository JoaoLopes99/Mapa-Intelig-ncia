import { Router, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuração do multer
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }
  // Monta URLs dos arquivos
  const fileInfos = files.map((file) => ({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  }));
  res.status(201).json({ files: fileInfos });
});

export default router; 