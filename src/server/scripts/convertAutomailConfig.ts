import mongoose from 'mongoose';
import { config } from '@app/config';
import { emailTemplateConfigRepository } from '@app/crm';

const convertAutoMail = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await emailTemplateConfigRepository.convert();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

convertAutoMail();
