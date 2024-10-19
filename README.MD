# CNotifySDK (web_cnotify_sdk) 🔔

1. Install the SDK

```bash
$ todo
```

2. Import the SDK

```javascript
import CNotifySDK from 'cnotify-sdk';
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
CNotifySDK.getInstance(
  { apiKey: '<cnotify_api_key>' },
  {
    testing: true,
    firebaseConfig: firebaseConfig,
  }
);

// Or initialize CNotifySDK from an existing Firebase App
// CNotifySDK.getInstance(
//   { apiKey: '<cnotify_api_key>' },
//   {
// testing: true,
// firebaseApp: app,
//   }
// );
```
