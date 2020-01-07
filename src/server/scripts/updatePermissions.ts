import mongoose from 'mongoose';
import { config } from '@app/config';
import { roleRepository } from '@app/auth';
import cache from 'memory-cache';
import { PERMISSIONS } from '@common/permissions';
import _ from 'lodash';

const updatePermissions = async () => {
  const allPermissions = _(PERMISSIONS).values()
    .map((permissionGroup) => _.values(permissionGroup))
    .flatten()
    .value();

  await cache.clear();
  const adminRole = await roleRepository.findOne({name: 'administrator'}) as any;
  await roleRepository.update({
    _id: adminRole._id,
    id: adminRole.id,
    name: 'administrator',
    description: 'administrator',
    permissions: allPermissions,
    isDefault: false,
    isActive: true,
  } as any);
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await updatePermissions();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

processing();
