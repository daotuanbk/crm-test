import mongoose from 'mongoose';
import { config } from '@app/config';
import { contactRepository } from '@app/crm';

const mainFunc = async () => {
  await contactRepository.updateAllSource();
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await mainFunc();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

processing();
