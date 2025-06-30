import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const modelosDir = path.resolve(__dirname, '../../public/modelos');

fs.readdirSync(modelosDir).forEach(file => {
  if (file.endsWith('.xlsx')) {
    const filePath = path.join(modelosDir, file);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = json[0];
    console.log(`Arquivo: ${file}`);
    console.log('Colunas:', headers);
    console.log('-----------------------------');
  }
}); 