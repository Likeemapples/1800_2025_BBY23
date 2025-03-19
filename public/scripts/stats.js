async function getFirebaseConfig() {
  const response = await fetch("/firebase-config");
  const firebaseConfig = await response.json();
  return firebaseConfig;
}

async function initizliazeFirebase() {
  const firebaseConfig = await getFirebaseConfig();
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized.", firebaseConfig);

  firebase.auth().onAuthStateChanged((user) => {
    createKPIs(user);
  });
}

async function getUserStats(user) {
  console.log("init", "getUserStats");
  try {
    const idToken = await user.getIdToken(true);
    const response = await fetch("/users/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    console.error(`${error.name} getting user stats`, error);
    return null;
  }
}

async function createKPIs(user) {
  const { completedEcoActionsCount, ecogroupsCount } = await getUserStats(user);

  const completedEcoActionsKPI = new Chart(document.getElementById("completed-ecoaction-count"), {
    type: "doughnut",
    data: {
      labels: ["Completed EcoActions", "Missed EcoActions"],
      datasets: [
        {
          data: [completedEcoActionsCount, 0],
          backgroundColor: [
            `${window.getComputedStyle(document.body).getPropertyValue("--green-primary")}`,
          ],
          hoverOffset: 4,
        },
      ],
    },
  });
}

initizliazeFirebase();
