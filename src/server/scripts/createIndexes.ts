import { readdir } from 'fs-extra';
import { logger, isDev } from '@app/core';
import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createIndexes = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });

  const moduleNames = await readdir(`${isDev ? 'src' : 'dist'}/server/modules`);
  const excludedModules: string[] = ['website'];
  const excludedAggregates: string[] = ['helpers', 'auth', 'permissions', 'profiles', 'webhooks', '.DS_Store'];

  const createIndexPromises = [];
  for (const module of moduleNames) {
    if (excludedModules.indexOf(module) !== -1) {
      continue;
    }

    const aggregateNames = await readdir(`${isDev ? 'src' : 'dist'}/server/modules/${module}/aggregates`);
    for (const aggregateName of aggregateNames) {
      if (excludedAggregates.indexOf(aggregateName) !== -1 || aggregateName.indexOf('index') === 0) {
        continue;
      }

      logger.info(`[Create Index] [${module}] ${aggregateName} ...`);
      const serviceRepositoryUrl = `../modules/${module}/aggregates/${aggregateName}/${aggregateName}.repository`;
      try {
        const repository: any = require(serviceRepositoryUrl);
        const createRepoIndexes = repository[Object.keys(repository)[Object.keys(repository).length - 1]].ensureIndexes;
        if (createRepoIndexes) {
          const createRepoIndexesWithTryCatch = async () => {
            try {
              await createRepoIndexes();
            } catch (error) {
              logger.info(error);
            }
          };
          createIndexPromises.push(createRepoIndexesWithTryCatch());
        }
      } catch (error) {
        // tslint:disable
        console.log(error);
      }
    }
  }
  try {
    await Promise.all(createIndexPromises);
  } catch (error) {
    logger.error(error.message);
  }

  console.log('Create indexes success');
  process.exit();
};

createIndexes();
