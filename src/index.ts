import { FirebaseApp, initializeApp, FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { AudienceController } from './controllers';
import {
  MetadataGenerator,
  IInternalMetadata,
  MetadataStorage,
  MetadataComparison,
} from './utils';
import { PermissionResult } from './constants/permission.constants';

export interface CNotifySDKCredentials {
  apiKey: string;
}

export interface CNotifySDKOptions {
  firebaseApp?: FirebaseApp;
  firebaseConfig?: FirebaseOptions;
  file?: string;
  testing?: boolean;
  appVersion?: string;
  requestPermissions?: boolean;
}

export default class CNotifySDK {
  private static instance: CNotifySDK;
  private metadataStorage: MetadataStorage;

  private subscribedToTopics: boolean = false;
  private readonly apiKey: string;
  private readonly appVersion: string | undefined;
  private testingMode: boolean = false;
  private firebaseApp: FirebaseApp;

  private constructor(
    credentials: CNotifySDKCredentials,
    options: CNotifySDKOptions = {}
  ) {
    this.apiKey = credentials.apiKey;
    this.testingMode = options.testing || false;
    this.appVersion = options.appVersion;
    this.metadataStorage = new MetadataStorage();

    this.printCNotifySDK(`🚀 Initializing (Version: 1.0.13)`);
    this.initializeFirebase(
      options.firebaseApp,
      options.firebaseConfig,
      options.file,
      options.requestPermissions
    );
  }

  public static getInstance(
    credentials: CNotifySDKCredentials,
    options: CNotifySDKOptions
  ): CNotifySDK {
    if (!CNotifySDK.instance) {
      CNotifySDK.instance = new CNotifySDK(credentials, options);
    }
    return CNotifySDK.instance;
  }

  private initializeFirebase(
    firebaseApp?: FirebaseApp,
    firebaseConfig?: FirebaseOptions,
    file?: string,
    requestPermissions: boolean = true
  ): void {
    this.printCNotifySDK('⚙️ Initializing Firebase');

    if (firebaseApp) {
      this.firebaseApp = firebaseApp;
      this.printCNotifySDK('Using existing Firebase app');
    } else if (firebaseConfig) {
      try {
        this.firebaseApp = initializeApp(firebaseConfig);
        this.printCNotifySDK('Firebase app initialized successfully');
      } catch (error) {
        this.printCNotifySDK(`Error initializing Firebase app: ${error}`);
        throw error;
      }
    } else if (file) {
      // TODO: Implement file initialization
      throw new Error('File initialization not implemented');
    } else {
      throw new Error('Either firebaseApp or firebaseConfig must be provided');
    }

    if (requestPermissions) {
      this.requestPermissions();
    }
  }

  public requestPermissions(): Promise<PermissionResult> {
    this.printCNotifySDK('Checking notification permissions');
    // Note: Web notification permissions are handled differently
    // You'll need to use the Notification API here
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.printCNotifySDK('😁 Notification permissions granted');
          this.attemptTopicSubscription();
          return PermissionResult.GRANTED;
        } else {
          this.printCNotifySDK('🚨 Notification permissions denied');
          return PermissionResult.DENIED;
        }
      });
    } else {
      this.printCNotifySDK('🚨 Notification API not available');
      return Promise.resolve(PermissionResult.DENIED);
    }
  }

  private attemptTopicSubscription(attempt: number = 1): void {
    this.printCNotifySDK(
      `🔄 Attempting topic subscription (Attempt ${attempt}/5)`
    );

    if (attempt > 5) {
      this.printCNotifySDK(
        '🚨 Max attempts reached. Unable to subscribe to topics.'
      );
      return;
    }

    this.subscribeToTopics();
  }

  private async subscribeToTopics(): Promise<void> {
    if (this.subscribedToTopics) {
      this.printCNotifySDK(
        '🙅🏽‍♂️ Tried to subscribe to topics but already subscribed'
      );
      return;
    }
    this.printCNotifySDK('🔎 Starting topic subscription');

    const metadataGenerator = new MetadataGenerator(this.appVersion);
    const internalMetadata = metadataGenerator.getInternalMetadata();
    const previousMetadata = this.metadataStorage.getSubscribedMetadata();

    if (MetadataComparison.areEqual(internalMetadata, previousMetadata)) {
      this.printCNotifySDK(
        `🥳 Checked for topic changes but already subscribed to all topics`
      );
      return;
    }

    this.printCNotifySDK(
      '😳 Found changes in topics, subscribing to new topics'
    );

    const unsubscribeSuccess = await this.remoteUnsubscribeTopics();
    if (!unsubscribeSuccess) {
      this.printCNotifySDK(
        '🚨 Failed to unsubscribe from previous topics, aborting'
      );
      return;
    }

    const subscribeSuccess = await this.remoteSubscribeTopics(internalMetadata);
    if (!subscribeSuccess) {
      this.printCNotifySDK('🚨 Failed to subscribe to new topics, aborting');
      return;
    }

    this.metadataStorage.persistSubscribedMetadata(internalMetadata);

    this.subscribedToTopics = true;
    this.printCNotifySDK('🏁 Topic subscription ended');
  }

  private async remoteSubscribeTopics(
    internalMetadata: IInternalMetadata
  ): Promise<boolean> {
    this.printCNotifySDK(`🟢 Subscribing to topics...`);
    const token = await this.getRegistrationToken();

    const { status } = await AudienceController.subscribe(
      {
        firebaseRegistrationToken: token,
        testingMode: this.testingMode,
        internalMetadata: internalMetadata,
      },
      { apiKey: this.apiKey }
    );

    return status === 'success';
  }

  private async remoteUnsubscribeTopics(): Promise<boolean> {
    this.printCNotifySDK(`🟡 Unsubscribing topics...`);

    const token = await this.getRegistrationToken();
    const { status } = await AudienceController.unsubscribe(
      {
        firebaseRegistrationToken: token,
      },
      { apiKey: this.apiKey }
    );

    return status === 'success';
  }

  private printCNotifySDK(message: string): void {
    console.log(`[CNotifySDK] ${message}`);
  }

  private async getRegistrationToken(): Promise<string> {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );
        this.setOnMessageHandler();
        return getToken(getMessaging(this.firebaseApp), {
          serviceWorkerRegistration: swRegistration,
        });
      } catch (error) {
        this.printCNotifySDK(
          '/firebase-messaging-sw.js not found, trying to get token without manual service worker registration'
        );
        this.setOnMessageHandler();
        return getToken(getMessaging(this.firebaseApp));
      }
    }

    return getToken(getMessaging(this.firebaseApp));
  }

  private setOnMessageHandler(): void {
    onMessage(getMessaging(this.firebaseApp), (payload) => {
      console.log('Message received. ', payload);
      this.printCNotifySDK(`Message received: ${JSON.stringify(payload)}`);
    });
  }
}
