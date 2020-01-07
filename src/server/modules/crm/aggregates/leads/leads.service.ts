import { customRouteAuthenticate } from '@app/core';
import { LeadsService } from '@app/crm';
import { updateAvatar } from './services/updateAvatar';
import { getByLmsId } from './services/getByLmsId';
import { synchronizeClass } from './services/synchronizeClass';
import { syncWithLms } from './services/syncWithLms';
import { updateDataTuition } from './services/updateDataTuition';
import { addReminder } from './services/addReminder';
import { updateReminder } from './services/updateReminder';
import { addNote } from './services/addNote';
import { addAppointment } from './services/addAppointment';
import { updateAppointment } from './services/updateAppointment';
import { find } from './services/find';
import { get } from './services/get';
import { create } from './services/create';
import { patch } from './services/patch';
import { addFamilyMember } from './services/addFamilyMember';
import { updateFamilyMember } from './services/updateFamilyMember';
import { updateCustomer } from './services/updateCustomer';
import { getActiveLeadByPhoneNumber } from './services/getActiveLeadByPhoneNumber';
import { importLeadsMiddleware, importLeads } from './services/importLeads';
import { downloadImportLeadsExcelTemplate } from './services/downloadImportLeadsExcelTemplate';
import { updateLeadProducts } from './services/updateLeadProducts';
import { createLeadOrder } from './services/createLeadOrder';
import { updateProductEnrollmentItem } from './services/updateProductEnrollmentItem';
import { addOrderProductItem } from './services/addOrderProductItem';
import { deleteOrderProductItem } from './services/deleteOrderProductItem';
import { sendEnrollmentRequest } from './services/sendEnrollmentRequest';
import { cancelEnrollmentRequest } from './services/cancelEnrollmentRequest';
import { addPayment } from './services/addPayment';
import { addRefund } from './services/addRefund';
import { addProductEnrollmentItem } from './services/addProductEnrollmentItem';
import { updateOrderProductItem } from './services/updateOrderProductItem';

const leadsService: LeadsService = {
  setup: (app, path) => {
    app.get(path + '/update-avatar', updateAvatar);
    app.get(path + '/getByLmsId/:lmsStudentId', getByLmsId);
    app.post(path + '/synchronize-class', synchronizeClass);
    app.post(path + '/sync-with-lms', syncWithLms);
    app.post(path + '/update-data-tuition', updateDataTuition);
    app.post(path + '/:id/reminders', customRouteAuthenticate, addReminder);
    app.patch(path + '/:id/reminders/:reminderId', customRouteAuthenticate, updateReminder);
    app.post(path + '/:id/notes', customRouteAuthenticate, addNote);
    app.post(path + '/:id/appointments', customRouteAuthenticate, addAppointment);
    app.patch(path + '/:id/appointments/:appointmentId', customRouteAuthenticate, updateAppointment);
    app.post(path + '/:id/family', customRouteAuthenticate, addFamilyMember);
    app.patch(path + '/:id/family/:familyMemberId', customRouteAuthenticate, updateFamilyMember);
    app.patch(path + '/:id/customer', customRouteAuthenticate, updateCustomer);
    app.patch(path + '/:id/products', customRouteAuthenticate, updateLeadProducts);
    app.post(path + '/:id/order', customRouteAuthenticate, createLeadOrder);
    app.post(path + '/:id/order/productItems', customRouteAuthenticate, addOrderProductItem);
    app.delete(path + '/:id/order/productItems/:orderProductItemId', customRouteAuthenticate, deleteOrderProductItem);
    app.patch(path + '/:id/order/productItems/:orderProductItemId', customRouteAuthenticate, updateOrderProductItem);
    app.post(path + '/:id/order/:productItemId/enrollments', customRouteAuthenticate, addProductEnrollmentItem);
    app.patch(path + '/:id/order/:productItemId/enrollments/:productEnrollmentItemId', customRouteAuthenticate, updateProductEnrollmentItem);
    app.post(path + '/:id/order/:productItemId/enrollments/:productEnrollmentItemId', customRouteAuthenticate, sendEnrollmentRequest);
    app.delete(path + '/:id/order/:productItemId/enrollments/:productEnrollmentItemId', customRouteAuthenticate, cancelEnrollmentRequest);
    app.post(path + '/:id/payment', customRouteAuthenticate, addPayment);
    app.post(path + '/:id/refund', customRouteAuthenticate, addRefund);
    app.get(path + '/get-active-lead-by-phone-number/:phoneNumber', customRouteAuthenticate, getActiveLeadByPhoneNumber);
    app.post(path + '/import-leads', customRouteAuthenticate, importLeadsMiddleware.single('leads'), importLeads);
    app.get(path + '/excel-template', downloadImportLeadsExcelTemplate);
  },
  find,
  get,
  create,
  patch,
};

export default leadsService;
