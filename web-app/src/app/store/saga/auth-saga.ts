import { app } from '../../../firebase';
import { type PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  USER_PROFILE_LOGIN,
  USER_PROFILE_LOGOUT,
  USER_PROFILE_SIGNUP,
  type User,
  USER_PROFILE_SIGNUP_SUCCESS,
  type OauthProvider,
  USER_PROFILE_LOGIN_WITH_PROVIDER,
  USER_PROFILE_CHANGE_PASSWORD,
  USER_PROFILE_RESET_PASSWORD,
  type UserData,
} from '../../types';
import 'firebase/compat/auth';
import {
  changePasswordFail,
  changePasswordSuccess,
  loginFail,
  loginSuccess,
  logoutSuccess,
  signUpFail,
  signUpSuccess,
  resetPasswordFail,
  resetPasswordSuccess,
} from '../profile-reducer';
import { type NavigateFunction } from 'react-router-dom';
import {
  getUserFromSession,
  populateUserWithAdditionalInfo,
  retrieveUserInformation,
  sendEmailVerification,
} from '../../services';
import {
  type AdditionalUserInfo,
  type UserCredential,
  getAdditionalUserInfo,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getAuth,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getAppError } from '../../utils/error';

function* emailLoginSaga({
  payload: { email, password },
}: PayloadAction<{ email: string; password: string }>): Generator<
  unknown,
  void,
  User
> {
  try {
    yield app.auth().signInWithEmailAndPassword(email, password);
    const user = yield call(getUserFromSession);
    const userData = (yield call(retrieveUserInformation)) as UserData;
    const userEnhanced = populateUserWithAdditionalInfo(
      user,
      userData,
      undefined,
    );
    yield put(loginSuccess(userEnhanced));
  } catch (error) {
    yield put(loginFail(getAppError(error)));
  }
}

function* logoutSaga({
  payload: { redirectScreen, navigateTo },
}: PayloadAction<{
  redirectScreen: string;
  navigateTo: NavigateFunction;
}>): Generator {
  try {
    yield app.auth().signOut();
    yield put(logoutSuccess());
    navigateTo(redirectScreen);
  } catch (error) {
    yield put(loginFail(getAppError(error)));
  }
}

function* signUpSaga({
  payload: { email, password, redirectScreen, navigateTo },
}: PayloadAction<{
  email: string;
  password: string;
  redirectScreen: string;
  navigateTo: NavigateFunction;
}>): Generator {
  try {
    yield app.auth().createUserWithEmailAndPassword(email, password);
    const user = yield call(getUserFromSession);
    if (user === null) {
      throw new Error('User not found');
    }
    yield put(signUpSuccess(user as User));
    navigateTo(redirectScreen);
  } catch (error) {
    yield put(signUpFail(getAppError(error)));
  }
}

function* changePasswordSaga({
  payload: { oldPassword, newPassword },
}: PayloadAction<{
  oldPassword: string;
  newPassword: string;
}>): Generator {
  const user = app.auth().currentUser;
  if (user === null) {
    throw new Error('User not found');
  }
  if (user.email === null) {
    throw new Error('User email not found');
  }
  const credential = EmailAuthProvider.credential(user.email, oldPassword);
  try {
    yield reauthenticateWithCredential(user, credential);
    yield user.updatePassword(newPassword);
    yield put(changePasswordSuccess());
  } catch (error) {
    yield put(changePasswordFail(getAppError(error)));
  }
}

function* sendEmailVerificationSaga(): Generator {
  try {
    yield call(sendEmailVerification);
  } catch (error) {
    yield put(signUpFail(getAppError(error)));
  }
}

function* loginWithProviderSaga({
  payload: { oauthProvider, userCredential },
}: PayloadAction<{
  oauthProvider: OauthProvider;
  userCredential: UserCredential;
}>): Generator {
  try {
    const user = (yield call(getUserFromSession)) as User;
    const additionalUserInfo = (yield call(
      getAdditionalUserInfo,
      userCredential,
    )) as AdditionalUserInfo;
    const userData = (yield call(retrieveUserInformation)) as UserData;
    const userEnhanced = populateUserWithAdditionalInfo(
      user,
      userData,
      additionalUserInfo,
    );
    yield put(loginSuccess(userEnhanced));
  } catch (error) {
    yield put(loginFail(getAppError(error)));
  }
}

function* resetPasswordSaga({
  payload: email,
}: PayloadAction<string>): Generator {
  try {
    const auth = getAuth();
    yield call(async () => {
      await sendPasswordResetEmail(auth, email);
    });
    yield put(resetPasswordSuccess());
  } catch (error) {
    yield put(resetPasswordFail(getAppError(error)));
  }
}

export function* watchAuth(): Generator {
  yield takeLatest(USER_PROFILE_LOGIN, emailLoginSaga);
  yield takeLatest(USER_PROFILE_LOGOUT, logoutSaga);
  yield takeLatest(USER_PROFILE_SIGNUP, signUpSaga);
  yield takeLatest(USER_PROFILE_SIGNUP_SUCCESS, sendEmailVerificationSaga);
  yield takeLatest(USER_PROFILE_LOGIN_WITH_PROVIDER, loginWithProviderSaga);
  yield takeLatest(USER_PROFILE_CHANGE_PASSWORD, changePasswordSaga);
  yield takeLatest(USER_PROFILE_RESET_PASSWORD, resetPasswordSaga);
}
