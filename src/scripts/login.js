import { firebaseConfig } from "./auth.js";

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ui = new firebaseui.auth.AuthUI(firebase.auth());
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: async (authResult, redirectUrl) => {
      try {
        const response = await fetch("/user-doc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authResult,
          }),
        });
        console.log("user-doc success response", response);
        return true;
      } catch (error) {
        console.error("Error creating user document:", error);
        return false;
      }
    },
    uiShown: () => {},
  },
  signInFlow: "popup",
  signInSuccessUrl: "/html/home.html",
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  tosUrl: "<your-tos-url>",
  privacyPolicyUrl: "<your-privacy-policy-url>",
};

ui.start("#firebase-ui-auth-container", uiConfig);
