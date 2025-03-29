const CHART_FONT = {
  size: 13,
  family: "'Poppins', sans-serif",
  weight: "bold",
};

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
  const {
    completedEcoActionsCount,
    ecoGroupsCount,
    missedEcoActionsCount,
    weeklyEcoPoints,
    minDate,
  } = await getUserStats(user);

  const completedMissedEcoActionsKPI = new Chart(
    document.getElementById("missed-completed-ecoaction-count"),
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
        plugins: {
          title: {
            display: true,
            text: "Missed vs. Completed EcoActions",
            font: CHART_FONT,
          },
          legend: {
            display: false,
          },
        },
      },
    }
  );

  const weeklyEcoPointsChart = new Chart(document.getElementById("weekly-ecopoints-over-time"), {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Weekly EcoPoints Over Time",
          data: weeklyEcoPoints,
          borderColor: `${window
            .getComputedStyle(document.body)
            .getPropertyValue("--green-primary")}`,
          backgroundColor: `${window
            .getComputedStyle(document.body)
            .getPropertyValue("--green-primary")}`,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "week",
            round: "week",
            displayFormats: {
              week: "MM/dd",
            },
          },
          min: minDate,
          max: new Date(),
          grid: {
            display: false,
            drawTicks: false,
          },
          ticks: {},
        },
        y: {
          title: {
            display: false,
          },
          grid: {
            drawTicks: false,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Weekly EcoPoints Over Time",
          font: CHART_FONT,
        },
        legend: {
          display: false,
        },
      },
    },
  });
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
  const userInfo = await response.json();
  console.log("userInfo", userInfo);
  const profileImage = userInfo.profileImage;

  const profileImageElement = document.querySelector(".profile-image");
  const profileIconElement = document.querySelector(".profile-icon");

  if (profileImage) {
    const elements = document.getElementsByClassName("navBarProfileImage");

    Array.from(elements).forEach((element) => {
      element.src = profileImage; // Pass the function reference, not the result of calling it
    });

    profileImageElement.style.display = "inline-block";
    profileIconElement.style.display = "none";
  } else {
    console.log("profile image was null");
  }

  const ecoPoints = userInfo.data.ecoPoints;
  console.log(ecoPoints);
  if (ecoPoints != null) {
    const elements = document.getElementsByClassName("navBarEcoPoints");

    // Loop through each element and update innerText with ecoPoints
    Array.from(elements).forEach((element) => {
      element.innerText = `${ecoPoints}`;
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
