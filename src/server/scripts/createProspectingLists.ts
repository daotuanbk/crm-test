import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createSystemConfigs = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
  const repositoryUrl = `../modules/crm/aggregates/prospecting-list/prospecting-list.repository`;
  try {
    const {prospectingListRepository}: any = require(repositoryUrl);
    if (prospectingListRepository.init) {
      await prospectingListRepository.init();
      console.log('Create prospecting lists success');
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
