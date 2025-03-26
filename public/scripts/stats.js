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
    populateUserInfo(user);
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
  const { completedEcoActionsCount, ecoGroupsCount, missedEcoActionsCount } = await getUserStats(
    user
  );

  console.log("Missed EcoActions", missedEcoActionsCount);

  const completedMissedEcoActionsKPI = new Chart(
    document.getElementById("completed-ecoaction-count"),
    {
      type: "doughnut",
      data: {
        labels: ["Completed EcoActions", "Missed EcoActions"],
        datasets: [
          {
            data: [completedEcoActionsCount, missedEcoActionsCount],
            backgroundColor: [
              `${window.getComputedStyle(document.body).getPropertyValue("--green-primary")}`,
              `${window
                .getComputedStyle(document.body)
                .getPropertyValue("--green-accent-primary")}`,
            ],
            hoverOffset: 5,
          },
        ],
      },
      options: {
        devicePixelRatio: 2, // for some reason will be blurry without this
      },
    }
  );
}

async function populateUserInfo(user) {
  const idToken = await user.getIdToken(true);

  const response = await fetch("/users/info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const userInfo = await response.json();
  console.log("Server Response JSON:", userInfo);

  if (!userInfo.success) {
    throw new Error(`Error fetching user data: ${userInfo.message}`);
  }

  const profileImage = userInfo.profileImage;

  if (profileImage) {
    console.log("navBarProfileImage", profileImage);
    const elements = document.getElementsByClassName("navBarProfileImage");

    Array.from(elements).forEach((element) => {
      element.src = profileImage; // Pass the function reference, not the result of calling it
    });
  }
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Logging out user");
      window.location.href = "/html/index.html"; // Redirect AFTER logout completes
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

initizliazeFirebase();

// Add event listeners to all buttons with the "signOut" class
const signOutButtons = document.querySelectorAll(".signOut");
signOutButtons.forEach((button) => {
  button.addEventListener("click", logout);
});
