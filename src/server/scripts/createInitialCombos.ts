import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createCombo = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
  const repositoryUrl = `../modules/crm/aggregates/product-combo/product-combo.repository`;
  try {
    const {productComboRepository}: any = require(repositoryUrl);
    if (productComboRepository.init) {
      await productComboRepository.init();
      console.log('Create combo success');
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

createCombo();
