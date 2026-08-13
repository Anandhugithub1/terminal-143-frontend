// Firebase Analytics is disabled for now. Left in place, commented out,
// so it can be switched back on later without re-wiring the integration.
//
// import { Capacitor } from "@capacitor/core"
// import { FirebaseAnalytics } from "@capacitor-firebase/analytics"
// import { initializeApp } from "firebase/app"
//
// const isNative = Capacitor.isNativePlatform()
//
// // Native builds get analytics from the Android/iOS Firebase SDKs via
// // google-services.json / GoogleService-Info.plist — no JS-side init needed.
// // Browser visitors have no native SDK to bridge to, so the plugin's web
// // fallback talks to firebase/analytics directly, which requires an app
// // initialized in this page context first.
// const firebaseConfig = {
//   apiKey: "AIzaSyC0YE1XGp28IaGJuG3tgKnUQnbRUrQIo0M",
//   authDomain: "pass-match-v02-app.firebaseapp.com",
//   projectId: "pass-match-v02-app",
//   storageBucket: "pass-match-v02-app.firebasestorage.app",
//   messagingSenderId: "589968916303",
//   appId: "1:589968916303:web:8957249142291e30cb8f3a",
//   measurementId: "G-68MM0Q7SQ9",
// }
//
// if (!isNative) {
//   try {
//     initializeApp(firebaseConfig)
//   } catch {
//     // Analytics is non-essential — the app must still run if this fails
//     // (e.g. blocked by an ad-blocker/privacy extension).
//   }
// }

export function logEvent() {
  // FirebaseAnalytics.logEvent({ name, params }).catch(() => {})
}

export function setScreenName() {
  // FirebaseAnalytics.setCurrentScreen({ screenName }).catch(() => {})
}

export function setUserId() {
  // FirebaseAnalytics.setUserId({ userId }).catch(() => {})
}

export function setUserProperty() {
  // FirebaseAnalytics.setUserProperty({ key, value }).catch(() => {})
}
