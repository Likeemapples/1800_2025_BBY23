const COLOURS = [
  "#1B5E20", // Very Dark Pine Green
  "#558B2F", // Strong Leaf Green
  "#A9D18E", // Soft Sage Green
  "#8FBC8F", // Dark Sea Green
  "#2E7D32", // Deep Forest Green
  "#779155", // Muted Olive Green
  "#386641", // Mossy Forest Green

  "#A0522D", // Sienna
  "#C5E1A5", // Pale Leaf Green
  "#D4E2D4", // Very Pale Sage/Gray-Green
  "#7CB342", // Healthy Grass Green
  "#6B8E23", // OliveDrab
  "#4CAF50", // Standard Medium Green
  "#556B2F", // Dark Olive Green
  "#006400", // DarkGreen
  "#D2B48C", // Tan
  "#BCB88A", // Light Khaki/Dry Earth
  "#E0CDB6", // Pale Driftwood
  "#CD853F", // Peru
  "#8B7355", // Medium Wood Brown
  "#8B4513", // Saddle Brown / Rich Soil
  "#654321", // Dark Brown / Tree Bark
  "#5D4037", // Deep Earth Brown
  "#3E2723", // Very Dark Espresso
];

const CHART_TITLE_FONT = {
  size: 25,
  family: "'Arial', sans-serif",
  weight: "bold",
};

const DONUT_OPTIONS_COMMON = {
  cutout: "68%",
  maintainAspectRatio: false,
  devicePixelRatio: 2, // for some reason will be blurry without this
};

const DONUT_ECOACTIONS_OPTIONS_COMMON = {
  ...DONUT_OPTIONS_COMMON,
  plugins: {
    tooltip: {
      displayColors: false,
    },
    title: { display: false },
    legend: { display: false },
  },
};

const DONUT_DATASET_COMMON = {
  backgroundColor: COLOURS,
  borderWidth: 10,
  borderColor: "white",
  borderRadius: 25,
  hoverBorderColor: "white",
};

const GREEN_PRIMARY = window.getComputedStyle(document.body).getPropertyValue("--green-primary");
const GREEN_SECONDARY = window
  .getComputedStyle(document.body)
  .getPropertyValue("--green-secondary");

const WEEK_IN_MILLISECONDS = 6.048e8;
const MOBILE_QUERY = window.matchMedia("(max-width: 810px)");
let NUM_WEEKS_TO_DISPLAY_IN_CHART = 6;

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
  const {
    ecoPointsBreakdown_thisWeek,
    lifetimeEcoActions,
    completedEcoActionsByCategory,
    completedEcoActionsByCategory_thisWeek,
    totalWeekCompletedEcoActions,
    totalWeekEcoPoints,
    weeklyEcoPoints,
    currentWeekStart,
    kpis,
  } = await getUserStats(user);

  document.getElementById("loader").classList.toggle("hidden");
  document.querySelector("main").classList.toggle("hidden");

  console.log("weeklyEcoPoints", weeklyEcoPoints);

  for (const kpi in kpis) {
    document.querySelector(`#${kpi} .kpi-value`).textContent = kpis[kpi];
  }

  const thisWeekCompletedEcoActionsByCategory = new Chart(
    document.getElementById("this-week-completed-ecoactions-by-category"),
    {
      type: "doughnut",
      data: {
        labels: Object.keys(completedEcoActionsByCategory_thisWeek),
        datasets: [
          {
            label: "EcoActions",
            data: Object.values(completedEcoActionsByCategory_thisWeek),
            ...DONUT_DATASET_COMMON,
          },
        ],
      },
      options: DONUT_ECOACTIONS_OPTIONS_COMMON,
      plugins: [getDonutCenterText(totalWeekCompletedEcoActions, "Completed", "EcoActions")],
    }
  );

  const lifetimeCompletedEcoActionsByCategory = new Chart(
    document.getElementById("lifetime-completed-ecoactions-by-category"),
    {
      type: "doughnut",
      data: {
        labels: Object.keys(completedEcoActionsByCategory),
        datasets: [
          {
            label: "EcoActions",
            data: Object.values(completedEcoActionsByCategory),
            ...DONUT_DATASET_COMMON,
          },
        ],
      },
      options: DONUT_ECOACTIONS_OPTIONS_COMMON,
      plugins: [getDonutCenterText(lifetimeEcoActions, "Completed", "EcoActions")],
    }
  );

  const thisWeekEcoPointsBreakdown = new Chart(
    document.getElementById("this-week-ecopoints-breakdown"),
    {
      type: "doughnut",
      data: {
        labels: Object.keys(ecoPointsBreakdown_thisWeek),
        datasets: [
          {
            label: "EcoPoints",
            data: Object.values(ecoPointsBreakdown_thisWeek),
            ...DONUT_DATASET_COMMON,
          },
        ],
      },
      options: {
        ...DONUT_OPTIONS_COMMON,
        plugins: {
          tooltip: {
            displayColors: false,
            callbacks: { label: (label) => `${label.formattedValue} 🪙` },
          },
          title: { display: false },
          legend: { display: false },
        },
      },
      plugins: [getDonutCenterText(totalWeekEcoPoints, "EcoPoints")],
    }
  );

  const weeklyEcoPointsChart = await new Chart(
    document.getElementById("weekly-ecopoints-over-time"),
    {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Weekly EcoPoints",
            data: weeklyEcoPoints,
            borderSkipped: false,
            borderRadius: 5,
            backgroundColor: `${GREEN_SECONDARY}`,
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
            min: new Date(currentWeekStart - NUM_WEEKS_TO_DISPLAY_IN_CHART * WEEK_IN_MILLISECONDS),
            max: new Date(),
            grid: {
              display: false,
              drawTicks: false,
            },
            border: { display: false },
          },
          y: {
            title: { display: false },
            grid: {
              displayTicks: false,
              color: (context) => (context.tick.value === 0 ? "transparent" : "rgba(0, 0, 0, 0.1)"),
            },
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
            color: `black`,
          },
          legend: { display: false },
        },
      },
    }
  );

  // update num of datapoints in weeklyEcoPointsChart when window size changes
  MOBILE_QUERY.addEventListener("change", () => {
    NUM_WEEKS_TO_DISPLAY_IN_CHART = MOBILE_QUERY.matches ? 4 : 6;
    weeklyEcoPointsChart.options.scales.x.min = new Date(
      currentWeekStart - NUM_WEEKS_TO_DISPLAY_IN_CHART * WEEK_IN_MILLISECONDS
    );
    weeklyEcoPointsChart.update();
  });
}

/**
 * Returns a plugin that adds text to the center of a donut chart.
 * @param {number} number - the number to display in the center of the donut chart
 * @param {string} text1 - the text to display below the number
 * @param {string} [text2] - the text to display below the text1 (optional)
 * @returns {object} a plugin for Chart.js
 */
function getDonutCenterText(number, text1, text2) {
  return {
    id: "donutCenterText",
    beforeDatasetsDraw(chart, args, options) {
      const { ctx, data } = chart;
      const centerX = chart.getDatasetMeta(0).data[0].x;
      const centerY = chart.getDatasetMeta(0).data[0].y;
      let centerYOffset = text2 ? 8 : 0;
      ctx.save();

      ctx.font = "bolder 50px 'Arial', sans-serif";
      ctx.fillStyle = `black`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${number}`, centerX, centerY - 5 - centerYOffset);

      ctx.font = "normal 14px 'Arial', sans-serif";
      ctx.fillStyle = `#6c757d`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${text1}`, centerX, centerY + 28 - centerYOffset);

      if (text2) {
        ctx.font = "normal 14px 'Arial', sans-serif";
        ctx.fillStyle = `#6c757d`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${text2}`, centerX, centerY + 45 - centerYOffset);
      }

      ctx.restore();
    },
  };
}

export function toggleStatsContainer(event) {
  const arrow = event.currentTarget;
  const arrowContainer = arrow.dataset.container;
  document.getElementById(`${arrowContainer}-container`).classList.toggle("collapsed");
  arrow.closest("h2").querySelector("#more-content").classList.toggle("shown");
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

initizliazeFirebase();

document.querySelectorAll(".signOut").forEach((button) => {
  button.addEventListener("click", logout);
});

document.querySelectorAll(".arrow-wrapper .lucide").forEach((arrow) => {
  arrow.addEventListener("click", (event) => {
    arrow.classList.toggle("open");
    toggleStatsContainer(event);
  });
});
