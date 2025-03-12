import { firebaseConfig } from "/config/auth.js";

firebase.initializeApp(firebaseConfig);

async function exampleRequest(user) {
  const idToken = await user.getIdToken(true);

  try {
    const response = await fetch("/users/ecoaction", {
      //replace with desired endpoint
      method: "POST", // GET, POST, PUT, DELETE
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ecoactionID: "test",
      }),
    });
    console.log("response", response);
  } catch (error) {
    console.error(error.name, error);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  exampleRequest(user);
});
