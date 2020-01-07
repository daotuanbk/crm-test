import { customRouteAuthenticate } from '@app/core';
import { ContactService } from '@app/crm';
import { summary } from './services/summary';
import { find } from './services/find';
import { get } from './services/get';
import { create } from './services/create';
import { updateDetail } from './services/updateDetail';
import { patch } from './services/patch';
import { addFamilyMember } from './services/addFamilyMember';
import { checkPhoneNumberExists } from './services/checkPhoneNumberExists';

const contactService: ContactService = {
  setup: (app, path) => {
    app.get(path + '/customs/summary', customRouteAuthenticate, summary);
    app.get(path + '/customs/check-phone-number-exists/:phoneNumber', customRouteAuthenticate, checkPhoneNumberExists);
  },
  find,
  get,
  create,
  patch,
  updateDetail,
  addFamilyMember,
};

export default contactService;
