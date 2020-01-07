import { createModel, ModelConfig } from '@rematch/core';
import { ProfileState } from './interface';

const profileModel: ModelConfig<ProfileState> = createModel({
  state: {
    authUser: null,
  },
  reducers: {
    updateProfileInfo: (state: ProfileState, payload: any) => {
      return {
        ...state,
        authUser: {
          ...state.authUser,
          ...payload,
        },
      };
    },
  },
  effects: {},
});

export default profileModel;
