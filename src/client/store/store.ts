import { init } from '@rematch/core';
import createLoadingPlugin from '@rematch/loading';
import profileModel from './models/profile/model';
import messengerModel from './models/messenger/model';
import mailModel from './models/mail/model';
import adsModel from './models/ads/model';
// loading plugin
const loadingOptions = {};
const loading = createLoadingPlugin(loadingOptions);

// init store
export const initStore = (initialState = {}) => {
  return init({
    models: {
      profileModel,
      messengerModel,
      mailModel,
      adsModel,
    },
    redux: {
      initialState,
    },
    plugins: [loading],
  });
};
