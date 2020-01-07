import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createSystemConfigs = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
  const systemConfigRepositoryUrl = `../modules/crm/aggregates/system-config/system-config.repository`;
  try {
    const {systemConfigRepository}: any = require(systemConfigRepositoryUrl);
    if (systemConfigRepository.init) {
      await systemConfigRepository.init();
      console.log('Create systemConfigs success');
    }
    else {
      console.log('init function is undefined. Please check again');
      process.exit(1);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
  process.exit();
};

createSystemConfigs();
