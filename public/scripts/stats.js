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

const MEDIA_QUERIES = {
  DESKTOP: window.matchMedia("(min-width: 1010px)"),
  MOBILE: window.matchMedia("(max-width: 810px)"),
  SMALL_MOBILE: window.matchMedia("(max-width: 600px) and (min-width: 451px)"),
  VERY_SMALL_MOBILE: window.matchMedia("(max-width: 450px)"),
};

const CHART_TITLE_FONT = {
  size: MEDIA_QUERIES.MOBILE.matches ? 20 : 25,
  family: "'Arial', sans-serif",
  weight: "bold",
};

const DONUT_OPTIONS_COMMON = {
  cutout: "68%",
  maintainAspectRatio: false,
  devicePixelRatio: 2, // for some reason will be blurry without this
};

const DONUT_ECOACTIONS_PLUGINS_COMMON = {
  tooltip: {
    displayColors: false,
  },
  title: { display: false },
  legend: { display: false },
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
let NUM_WEEKS_TO_DISPLAY_IN_CHART = MEDIA_QUERIES.MOBILE.matches ? 4 : 6;

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
      options: {
        ...DONUT_OPTIONS_COMMON,
        plugins: {
          ...DONUT_ECOACTIONS_PLUGINS_COMMON,
          donutCenterText: {
            number: totalWeekCompletedEcoActions,
            text1: "Completed",
            text2: "EcoActions",
            ...getDonutChartOffsets(true),
          },
        },
      },
      plugins: [donutCenterTextPlugin()],
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
      options: {
        ...DONUT_OPTIONS_COMMON,
        plugins: {
          ...DONUT_ECOACTIONS_PLUGINS_COMMON,
          donutCenterText: {
            number: lifetimeEcoActions,
            text1: "Completed",
            text2: "EcoActions",
            ...getDonutChartOffsets(true),
          },
        },
      },
      plugins: [donutCenterTextPlugin()],
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
          donutCenterText: {
            number: totalWeekEcoPoints,
            text1: "EcoPoints",
            ...getDonutChartOffsets(false),
          },
        },
      },
      plugins: [donutCenterTextPlugin()],
    }
  );

  const weeklyEcoPointsChart = new Chart(document.getElementById("weekly-ecopoints-over-time"), {
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
  });

  for (const query in MEDIA_QUERIES) {
    MEDIA_QUERIES[query].addEventListener("change", (event) => {
      NUM_WEEKS_TO_DISPLAY_IN_CHART = MEDIA_QUERIES.MOBILE.matches ? 4 : 6;
      CHART_TITLE_FONT.size = MEDIA_QUERIES.MOBILE.matches ? 20 : 25;

      console.log("event.matches", event.matches);

      thisWeekCompletedEcoActionsByCategory.options.plugins.donutCenterText = {
        number: totalWeekCompletedEcoActions,
        text1: "Completed",
        text2: "EcoActions",
        ...getDonutChartOffsets(true),
      };
      lifetimeCompletedEcoActionsByCategory.options.plugins.donutCenterText = {
        number: lifetimeEcoActions,
        text1: "Completed",
        text2: "EcoActions",
        ...getDonutChartOffsets(true),
      };
      thisWeekEcoPointsBreakdown.options.plugins.donutCenterText = {
        number: totalWeekEcoPoints,
        text1: "EcoPoints",
        ...getDonutChartOffsets(false),
      };
      weeklyEcoPointsChart.options.scales.x.min = new Date(
        currentWeekStart - NUM_WEEKS_TO_DISPLAY_IN_CHART * WEEK_IN_MILLISECONDS
      );
      weeklyEcoPointsChart.options.plugins.title.font = CHART_TITLE_FONT;

      thisWeekCompletedEcoActionsByCategory.update();
      lifetimeCompletedEcoActionsByCategory.update();
      thisWeekEcoPointsBreakdown.update();
      weeklyEcoPointsChart.update();
      console.log("Charts and center text options updated.");
    });
  }
}

/**
 * Calculates the vertical offset of a donut chart's number and description based
 * on if it has a second line of text.
 * @param {boolean} hasText2 - Whether the chart has a second line of text.
 * @returns {Object} An object with two properties: `offsetNum` and `offsetDesc`,
 * both of which are numbers.
 */
function getDonutChartOffsets(hasText2) {
  let offsetNum, offsetDesc;
  if (hasText2) {
    offsetNum = 8;
    offsetDesc = 8;
    if (MEDIA_QUERIES.MOBILE.matches) {
      offsetDesc += 11;
    }
  } else {
    offsetNum = 0;
    offsetDesc = 0;

    if (MEDIA_QUERIES.SMALL_MOBILE.matches || MEDIA_QUERIES.VERY_SMALL_MOBILE.matches) {
      offsetDesc += 11;
    } else if (MEDIA_QUERIES.MOBILE.matches) {
      offsetDesc += 7;
    }
  }
  return { offsetNum, offsetDesc };
}

/**
 * Computes the pixel value of a CSS clamp function with px and vw units.
 * clamp(minPx, preferredVw, maxPx)
 *
 * @param {number} minPx - The minimum value in pixels.
 * @param {number} preferredVw - The preferred value in vw units (e.g., 5 for 5vw).
 * @param {number} maxPx - The maximum value in pixels.
 * @returns {number} The calculated pixel value after clamping.
 */
function computeClamp(minPx, preferredVw, maxPx) {
  const preferredValuePx = (preferredVw / 100) * window.innerWidth;
  const clampedAtMin = Math.max(minPx, preferredValuePx);
  const clampedValuePx = Math.min(maxPx, clampedAtMin);

  return clampedValuePx;
}

/**
 * Returns a plugin that adds text to the center of a donut chart,
 * reading data from plugin options.
 * @returns {object} a plugin for Chart.js
 */
function donutCenterTextPlugin() {
  return {
    id: "donutCenterText",
    afterDatasetsDraw(chart, args, options) {
      const number = options.number ?? "";
      const text1 = options.text1 ?? "";
      const text2 = options.text2;

      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || !meta.data.length) {
        console.warn("Plugin exiting: Chart metadata not ready.");
        return;
      }
      if (number === "" && text1 === "") {
        console.warn("Plugin exiting: No number or text1 provided in options.");
        return;
      }

      const { ctx } = chart;
      const arc = meta.data[0];
      const centerX = arc.x;
      const centerY = arc.y;
      const descriptionFont = `normal ${computeClamp(10, 1.5, 14)}px 'Arial', sans-serif`;

      ctx.save();

      ctx.font = `bolder ${computeClamp(25, 5, 50)}px 'Arial', sans-serif`;
      ctx.fillStyle = `black`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${number}`, centerX, centerY - 5 - options.offsetNum);

      ctx.font = descriptionFont;
      ctx.fillStyle = `#6c757d`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${text1}`, centerX, centerY + 28 - options.offsetDesc);

      if (text2) {
        ctx.font = descriptionFont;
        ctx.fillStyle = `#6c757d`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${text2}`, centerX, centerY + 43 - options.offsetDesc);
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
