import { type RootState } from './store';

export * from './profile-selectors';

export const selectLoadingApp = (state: RootState): boolean => {
  return (
    state.userProfile.status === 'login_in' ||
    state.userProfile.status === 'registering' ||
    state.userProfile.status === 'login_out' ||
    state.userProfile.status === 'sign_up' ||
    state.userProfile.isAppRefreshing
  );
};
