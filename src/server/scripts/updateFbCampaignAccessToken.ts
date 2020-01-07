import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createFbAccessToken = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
  const systemConfigRepositoryUrl = `../modules/crm/aggregates/system-config/system-config.repository`;
  try {
    const {systemConfigRepository}: any = require(systemConfigRepositoryUrl);
    if (!systemConfigRepository.initFbCampaignAccessToken) {
      console.log('prospecting  in SystemConfig is undefined. Please check again');
      process.exit(1);
      return;
    }
    const args = process.argv;
    if (args.length !== 3) {
      console.log('Format is not valid. Ensure the format like "npm run updateFbCampaignAccessToken access_token"');
      process.exit(1);
      // npm run createFbAccessToken access_token
    }
    const access_token = args[2];
    await systemConfigRepository.initFbCampaignAccessToken(access_token);
    console.log('Init access_token success');
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
  process.exit();
};

createFbAccessToken();