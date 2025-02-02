import { type AppError, ErrorSource, type User } from '../types';
import { type RootState } from './store';

export const selectUserProfile = (state: RootState): User | undefined =>
  state.userProfile.user;

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.userProfile.status === 'authenticated' ||
  state.userProfile.status === 'registered';

export const selectUserProfileStatus = (state: RootState): string =>
  state.userProfile.status;

export const selectIsTokenRefreshed = (state: RootState): boolean =>
  !state.userProfile.isRefreshingAccessToken &&
  state.userProfile.errors.RefreshingAccessToken === null;

export const selectErrorBySource = (
  state: RootState,
  source: ErrorSource,
): AppError | null => state.userProfile.errors[source];

export const selectEmailLoginError = (state: RootState): AppError | null =>
  selectErrorBySource(state, ErrorSource.Login);

export const selectResetPasswordError = (state: RootState): AppError | null =>
  selectErrorBySource(state, ErrorSource.ResetPassword);

export const selectIsRecoveryEmailSent = (state: RootState): boolean =>
  state.userProfile.isRecoveryEmailSent;

export const selectSignUpError = (state: RootState): AppError | null =>
  selectErrorBySource(state, ErrorSource.SignUp);

export const selectRefreshingAccessTokenError = (
  state: RootState,
): AppError | null =>
  selectErrorBySource(state, ErrorSource.RefreshingAccessToken);

export const selectIsRefreshingAccessToken = (state: RootState): boolean =>
  state.userProfile.isRefreshingAccessToken;

export const selectSignedInWithProvider = (state: RootState): boolean =>
  state.userProfile.isSignedInWithProvider;

export const selectChangePasswordError = (state: RootState): AppError | null =>
  selectErrorBySource(state, ErrorSource.ChangePassword);

export const selectChangePasswordStatus = (state: RootState): string =>
  state.userProfile.changePasswordStatus;

export const selectRegistrationError = (state: RootState): AppError | null =>
  selectErrorBySource(state, ErrorSource.Registration);
