import mongoose from 'mongoose';
import { config } from '@app/config';

// tslint:disable:no-console
const createProductCourses = async () => {
  await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
  const productCourseRepositoryUrl = `../modules/crm/aggregates/product-course/product-course.repository`;
  try {
    const {productCourseRepository}: any = require(productCourseRepositoryUrl);
    if (productCourseRepository.init) {
      await productCourseRepository.init();
      console.log('Create productCourses success');
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

createProductCourses();
