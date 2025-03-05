import { firebaseConfig } from "./auth.js";

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ui = new firebaseui.auth.AuthUI(firebase.auth());
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: (authResult, redirectUrl) => {
      addUserToDB(authResult, redirectUrl);
      return true;
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
  await fetch("/serverlog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authResult),
  });

  // try {
  //   //if the userDoc doesn't exist, create it
  //   if (!(await userDoc.get().exists)) {
  //     await userDoc.set({
  //       email: userAuth.email,
  //       displayName: userAuth.displayName || "",
  //       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  //     });
  //     console.log("User document created");
  //   } else {
  //     console.log("User document already exists");
  //   }
  // } catch (error) {
  //   console.error("Error creating user document:", error);
  // }
  return true;
}

ui.start("#firebase-ui-auth-container", uiConfig);
