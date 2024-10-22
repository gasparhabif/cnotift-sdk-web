# CNotifySDK (web_cnotify_sdk) 🔔

- [Home](https://cnotify.me)
- [Platform](https://app.cnotify.me)
- [Docs](https://docs.cnotify.me)

## Get started

1. Install the SDK

```bash
$ npm i @eruka-tech/cnotify-sdk
```

2. Import the SDK

```javascript
import CNotifySDK from '@eruka-tech/cnotify-sdk';
```

3. Initialize the SDK

```javascript
const firebaseConfig = {
  apiKey: '<your_api_key>',
  authDomain: '<your_auth_domain>',
  projectId: '<your_project_id>',
  storageBucket: '<your_storage_bucket>',
  messagingSenderId: '<your_messaging_sender_id>',
  appId: '<your_app_id>',
  measurementId: '<your_measurement_id>',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize CNotifySDK from configs
const cnotify = CNotifySDK.getInstance(
  { apiKey: '<cnotify_api_key>' },
  {
    testing: true,
    firebaseConfig: firebaseConfig,
  }
);

// Or initialize CNotifySDK from an existing Firebase App
// CNotifyconst cnotify = SDK.getInstance(
//   { apiKey: '<cnotify_api_key>' },
//   {
// testing: true,
// firebaseApp: app,
//   }
// );
```

4. Request notification permissions

Permissions will be requested automatically when initializing the SDK, but there are some browsers that require permissions to be requested after a user gesture on the screen. To request notification permissions on demand, the SDK provides the following method:

```javascript
cnotify.requestPermissions().then((permission) => {
  if (permission === 'granted') {
    console.log('Notification permission granted ✅');
  } else {
    console.log('Notification permission denied ❌');
  }
});
```

## Examples

- [Next.JS example](https://github.com/tlofano/cnotify_nextjs_example)
