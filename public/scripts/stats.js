const CHART_TITLE_FONT = {
  size: 25,
  family: "'Arial', sans-serif",
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
    createStats(user);
  });
}

async function getUserStats(user) {
  console.log("init", "getUserStats");
  try {
    const idToken = await user.getIdToken(true);
    const response = await fetch("/stats", {
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

async function createStats(user) {
  const { ecoGroupsCount, weeklyEcoPoints, minDate, kpis } = await getUserStats(user);
  document.getElementById("loader").classList.toggle("hidden");
  document.querySelector("main").classList.toggle("hidden");

  for (const kpi in kpis) {
    document.querySelector(`#${kpi} .kpi-value`).textContent = kpis[kpi];
  }

  const ecoactionsBreakdown = new Chart(document.getElementById("ecoactions-breakdown"), {
    type: "doughnut",
    data: {
      labels: ["Completed", "Missed"],
      datasets: [
        {
          data: [kpis["lifetime-completed-ecoactions"], kpis["lifetime-missed-ecoactions"]],
          backgroundColor: [
            `${window.getComputedStyle(document.body).getPropertyValue("--green-primary")}`,
            `${window.getComputedStyle(document.body).getPropertyValue("--green-accent-primary")}`,
          ],
          hoverOffset: 5,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      devicePixelRatio: 2, // for some reason will be blurry without this
      plugins: {
        title: {
          display: true,
          text: "EcoActions Breakdown",
          font: CHART_TITLE_FONT,
          color: `${window.getComputedStyle(document.body).getPropertyValue("--green-secondary")}`,
        },
        legend: { display: false },
      },
    },
  });

  const weeklyEcoPointsChart = new Chart(document.getElementById("weekly-ecopoints-over-time"), {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Weekly EcoPoints",
          data: weeklyEcoPoints,
          borderRadius: 5,
          backgroundColor: `${window
            .getComputedStyle(document.body)
            .getPropertyValue("--green-primary")}`,
          barThickness: 50,
          barPercentage: 0.1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "week",
            round: "week",
            displayFormats: { week: "M/d" },
          },
          min: minDate,
          max: new Date(),
          grid: {
            display: false,
            drawTicks: false,
          },
        },
        y: {
          title: { display: false },
          grid: { drawTicks: false },
          border: { display: false },
        },
      },
      layout: { padding: 10 },
      plugins: {
        tooltip: {
          displayColors: false,
          callbacks: {
            // hide the title section of tooltip popup
            title: (title) => {
              const titleDate = new Date(title[0].parsed.x);
              return `Week of ${titleDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
              })}`;
            },
            label: (label) => `${label.formattedValue} 🪙`,
          },
        },
        title: {
          display: true,
          text: "Weekly EcoPoints",
          align: "start",
          padding: { bottom: 30 },
          font: CHART_TITLE_FONT,
          color: `${window.getComputedStyle(document.body).getPropertyValue("--green-secondary")}`,
        },
        legend: { display: false },
      },
    },
  });
}

export function toggleStatsContainer(event) {
  const arrow = event.currentTarget;
  const arrowContainer = arrow.dataset.container;
  document.getElementById(`${arrowContainer}-container`).classList.toggle("collapsed");
  arrow.closest("h2").querySelector("#more-content").classList.toggle("shown");
}

function showLoader() {
  document.querySelector("main").classList.toggle("hidden");
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

  const profileImageElements = document.querySelectorAll(".profile-image");
  const profileIconElements = document.querySelectorAll(".profile-icon");

  if (profileImage) {
    const elements = document.getElementsByClassName("navBarProfileImage");

    Array.from(elements).forEach((element) => {
      element.src = profileImage; // Pass the function reference, not the result of calling it
    });

    profileImageElements.forEach((element) => (element.style.display = "inline-block"));
    profileIconElements.forEach((element) => (element.style.display = "none"));
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

showLoader();
initizliazeFirebase();

document.querySelectorAll(".signOut").forEach((button) => {
  button.addEventListener("click", logout);
});
