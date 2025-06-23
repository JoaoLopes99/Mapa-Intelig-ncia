import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = './database.sqlite';

export const dbPromise = open({
  filename: DB_PATH,
  driver: sqlite3.Database
}); 