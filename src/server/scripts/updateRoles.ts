import mongoose from 'mongoose';
import { config } from '@app/config';
import { roleRepository } from '@app/auth';
import cache from 'memory-cache';
import { PERMISSIONS } from '@common/permissions';
import _ from 'lodash';

const updateAccountantRole = async () => {
  const filter = { name: 'accountant' };
  const update = {
    permissions: [
      PERMISSIONS.ROLES.ACCOUNTANT,
      PERMISSIONS.LEAD_REFUND.CREATE,
      PERMISSIONS.LEAD_PAYMENT.CREATE,
      PERMISSIONS.LEADS.VIEW_ACCOUNTANT,
      PERMISSIONS.LEADS.VIEW_SCREEN,
      PERMISSIONS.LEADS.VIEW,
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.LMS_COURSES.VIEW,
      PERMISSIONS.PRODUCTS.VIEW,
      PERMISSIONS.CAMPAIGNS.VIEW,
      PERMISSIONS.CENTRES.VIEW,
    ],
    isActive: true,
    isDelete: false,
  };
  await roleRepository.upsertOne(filter, update);
};

const updateAdminRole = async () => {
  const filter = { name: 'administrator' };
  const allPermissions = _(PERMISSIONS).values()
    .map((permissionGroup) => _.values(permissionGroup))
    .flatten()
    .value();
  const update = {
    permissions: allPermissions,
  };
  await roleRepository.upsertOne(filter, update);
};

const updateSalesmanRole = async () => {
  const filter = { name: 'salesman' };
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW_SCREEN);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CLASSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CATEGORIES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.PRODUCTS.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LEADS.VIEW_SCREEN);
};

const updateGMRole = async () => {
  const filter = { name: 'GM' };
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW_SCREEN);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CLASSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CATEGORIES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.PRODUCTS.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LEADS.VIEW_SCREEN);
};

const updateSaleHORole = async () => {
  const filter = { name: 'SaleHO' };
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_COURSES.VIEW_SCREEN);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CLASSES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LMS_CATEGORIES.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.PRODUCTS.VIEW);
  await roleRepository.addPermissionIfNedeed(filter, PERMISSIONS.LEADS.VIEW_SCREEN);
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await cache.clear();
    await updateAdminRole();
    await updateSaleHORole();
    await updateGMRole();
    await updateSalesmanRole();
    await updateAccountantRole();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

processing();
