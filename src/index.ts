import { FirebaseApp, initializeApp, FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { CNotifyTopicGenerator } from './topic-generation';
import { CNotifyTopicStorage } from './storage';

export default class CNotifySDK {
  private static instance: CNotifySDK;

  private subscribedToTopics: boolean = false;
  private testingMode: boolean = false;
  private topicGenerator: CNotifyTopicGenerator;
  private topicStorage: CNotifyTopicStorage;
  private appVersion: string | undefined;

  private firebaseApp?: FirebaseApp;

  private constructor(
    options: {
      firebaseApp?: FirebaseApp;
      firebaseConfig?: FirebaseOptions;
      file?: string;
      testing?: boolean;
      appVersion?: string;
    } = {}
  ) {
    this.testingMode = options.testing || false;
    this.appVersion = options.appVersion;
    this.topicGenerator = new CNotifyTopicGenerator();
    this.topicStorage = new CNotifyTopicStorage();

    this.printCNotifySDK(`🚀 Initializing (Version: 1.0.0)`);
    this.initializeFirebase(
      options.firebaseApp,
      options.firebaseConfig,
      options.file
    );
  }

  public static getInstance(options: {
    firebaseApp?: FirebaseApp;
    firebaseConfig?: FirebaseOptions;
    file?: string;
    testing?: boolean;
    appVersion?: string;
  }): CNotifySDK {
    if (!CNotifySDK.instance) {
      CNotifySDK.instance = new CNotifySDK(options);
    }
    return CNotifySDK.instance;
  }

  private initializeFirebase(
    firebaseApp?: FirebaseApp,
    firebaseConfig?: FirebaseOptions,
    file?: string
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
      throw new Error('File initialization not implemented');
    } else {
      throw new Error('Either firebaseApp or firebaseConfig must be provided');
    }

    this.requestPermissions();
  }

  private requestPermissions(): void {
    this.printCNotifySDK('Checking notification permissions');
    // Note: Web notification permissions are handled differently
    // You'll need to use the Notification API here
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.printCNotifySDK('😁 Notification permissions granted');
          this.attemptTopicSubscription();
        } else {
          this.printCNotifySDK('🚨 Notification permissions denied');
        }
      });
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

    // TODO: Implement FCM token retrieval
    // For now, we'll assume the token is available and call subscribeToTopics
    this.subscribeToTopics();
  }

  private subscribeToTopics(): void {
    if (this.subscribedToTopics) {
      this.printCNotifySDK(
        '🙅🏽‍♂️ Tried to subscribe to topics but already subscribed'
      );
      return;
    }
    this.printCNotifySDK('🔎 Starting topic subscription');

    const topics = this.topicGenerator.getTopics({
      language: this.getLang(),
      country: this.getCountry(),
      appVersion: this.appVersion,
    });

    const previousTopics = this.topicStorage.getSubscribedTopics();

    if (
      JSON.stringify(topics.sort()) !== JSON.stringify(previousTopics.sort())
    ) {
      this.printCNotifySDK(
        '😳 Found changes in topics, subscribing to new topics'
      );
      previousTopics.forEach((topic) => this.unsubscribeFromTopic(topic));

      this.topicStorage.persistSubscribedTopics(topics);
      topics.forEach((topic) => this.subscribeTopic(topic));
    } else {
      this.printCNotifySDK(
        `🥳 Checked for topic changes but already subscribed to all topics (${topics})`
      );
    }

    if (this.testingMode) {
      this.subscribeTopic('testing-debug');
    }

    this.subscribedToTopics = true;
    this.printCNotifySDK('🏁 Topic subscription ended');
  }

  private async subscribeTopic(topic: string): Promise<void> {
    this.printCNotifySDK(`🟢 Subscribing to topic: ${topic}`);

    const token = await getToken(getMessaging(this.firebaseApp));
    // TODO: Send token to server for subscription
  }

  private unsubscribeFromTopic(topic: string): void {
    // TODO: Implement actual topic unsubscription using Firebase Messaging
    this.printCNotifySDK(`🟡 Unsubscribing from topic: ${topic}`);
  }

  private getLang(): string {
    return navigator.language.split('-')[0] || 'en';
  }

  private getCountry(): string {
    return navigator.language.split('-')[1] || '??';
  }

  private printCNotifySDK(message: string): void {
    console.log(`[CNotifySDK] ${message}`);
  }
}
