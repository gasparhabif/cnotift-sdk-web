import axios from 'axios';
import {
  ISubscribeInput,
  IUnsubscribeInput,
  ISubscriptionOutput,
  ICredentials,
} from './types';

const BASE_URL =
  'https://audience-service-dot-eruka-notify-me.uc.r.appspot.com/v1/subscription';

async function subscribe(
  input: ISubscribeInput,
  { apiKey }: ICredentials
): Promise<ISubscriptionOutput> {
  return post({
    uri: '/subscribe',
    input,
    apiKey,
  });
}

async function unsubscribe(
  input: IUnsubscribeInput,
  { apiKey }: ICredentials
): Promise<ISubscriptionOutput> {
  return post({
    uri: '/unsubscribe',
    input,
    apiKey,
  });
}

async function post({
  uri: rawUri,
  input,
  apiKey,
}: {
  uri: string;
  input: ISubscribeInput | IUnsubscribeInput;
  apiKey: string;
}): Promise<ISubscriptionOutput> {
  const uri = rawUri.includes('/') ? rawUri : `/${rawUri}`;
  const headers = {
    'x-api-key': apiKey,
  };

  try {
    const response = await axios.post(`${BASE_URL}${uri}`, input, {
      headers: headers,
    });

    if (response.status == 429) {
      return tooManyRequestsResponse();
    }

    if (response.status !== 200) {
      return errorResponse();
    }
  } catch (error) {
    console.log('[CNotifySDK] 🚨 Error while subscribing', error);
    return errorResponse();
  }

  return successResponse();
}

function successResponse(): ISubscriptionOutput {
  return {
    status: 'success',
  };
}

function errorResponse(): ISubscriptionOutput {
  return {
    status: 'error',
  };
}

function tooManyRequestsResponse(): ISubscriptionOutput {
  return {
    status: 'too_many_requests',
  };
}

export const AudienceController = {
  subscribe,
  unsubscribe,
};
