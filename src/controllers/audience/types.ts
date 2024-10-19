import { Language } from '../../constants/language.constants';

export interface IUnsubscribeInput {
  firebaseRegistrationToken: string;
}

export interface ISubscribeInput {
  firebaseRegistrationToken: string;
  testingMode: boolean;
  internalMetadata: {
    language: Language;
    platform: string;
    country: string;
    appVersion: string;
  };
}

export interface ICredentials {
  apiKey: string;
}

export interface ISubscriptionOutput {
  status: 'success' | 'error' | 'too_many_requests';
}
