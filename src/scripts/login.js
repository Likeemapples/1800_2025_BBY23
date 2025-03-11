import { firebaseConfig } from "./auth.js";

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ui = new firebaseui.auth.AuthUI(firebase.auth());
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: (authResult, redirectUrl) => {
    return addUserToDB(authResult);
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

function addUserToDB(authResult) {
  const userAuth = authResult.user;
  const userDoc = db.collection("users").doc(userAuth.uid);
  
  // await fetch("/serverlog", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(authResult),
  // });

  try {
    //if the userDoc doesn't exist, create it
    if (!(userDoc.get().exists)) {
       userDoc.set({
        email: userAuth.email,
        displayName: userAuth.displayName || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(function () {
        console.log("New user added to firestore");
        window.location.assign("/html/home.html");       //re-direct to main.html after signup
      }).catch(function (error) {
        console.log("Error adding new user: " + error);
      });
      console.log("User document created");
     } else {
        console.log("User document alteady exists");
        return true;
    }
        return false;
    } catch (error) {
    console.error("Error creating user document:", error);
  }
}

ui.start("#firebase-ui-auth-container", uiConfig);
