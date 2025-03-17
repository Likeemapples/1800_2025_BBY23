const { firebaseConfig } = await import("/config/auth.js");

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized.");

firebase.auth().onAuthStateChanged((user) => {
  getUserStats(user);
});

async function getUserStats(user) {
  const idToken = await user.getIdToken(true);
  fetch("/users/stats", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
}
