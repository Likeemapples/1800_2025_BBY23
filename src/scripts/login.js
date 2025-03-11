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

async function addUserToDB(authResult, redirectUrl) {
  const userAuth = authResult.user;
  const userDoc = db.collection("users").doc(userAuth.uid);
  fetch("/serverlog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authResult,
      userDoc,
      "userDoc.get": await userDoc.get(),
      userDocExists: await userDoc.get().exists,
    }),
  });

  try {
    //if the userDoc doesn't exist, create it
    if (!(await userDoc.get().exists)) {
      await userDoc.set({
        email: userAuth.email,
        displayName: userAuth.displayName || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("User document created");
    } else {
      console.log("User document already exists");
    }
  } catch (error) {
    console.error("Error creating user document:", error);
  }
}

ui.start("#firebase-ui-auth-container", uiConfig);
