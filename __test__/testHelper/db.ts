import { mongoDatabase } from '@app/core';
import { config } from './config';

class DB {
  static connected = false;
}

export async function startDb() {
  if (!DB.connected) {
    await mongoDatabase.startDatabase(config.database.testConnectionString);
    DB.connected = true;
  }
}

export async function stopDb() {
  if (DB.connected) {
    await mongoDatabase.stopDatabase();
  }
}
