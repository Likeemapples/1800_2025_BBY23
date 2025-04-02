const CHART_TITLE_FONT = {
  size: 25,
  family: "'Arial', sans-serif",
  weight: "bold",
};

const COLOURS = [
  "#1B5E20", // Very Dark Pine Green
  "#558B2F", // Strong Leaf Green
  "#A9D18E", // Soft Sage Green
  "#8FBC8F", // Dark Sea Green
  "#2E7D32", // Deep Forest Green
  "#F5F5DC", // Beige
  "#B2D8B4", // Washed Mint Green

  "#C5E1A5", // Pale Leaf Green

  "#90EE90", // LightGreen
  "#D4E2D4", // Very Pale Sage/Gray-Green

  // Mid-Tone & Natural Greens
  "#7CB342", // Healthy Grass Green

  "#779155", // Muted Olive Green

  "#6B8E23", // OliveDrab
  "#4CAF50", // Standard Medium Green

  // Deep & Forest Greens
  "#386641", // Mossy Forest Green

  "#556B2F", // Dark Olive Green
  "#006400", // DarkGreen

  // Light & Sandy Browns

  "#D2B48C", // Tan
  "#BCB88A", // Light Khaki/Dry Earth
  "#E0CDB6", // Pale Driftwood

  // Mid-Tone & Woodsy Browns
  "#CD853F", // Peru
  "#A0522D", // Sienna
  // "#B8860B", // DarkGoldenrod (Commented out - maybe less earthy for some)
  "#8B7355", // Medium Wood Brown

  // Dark & Soil Browns
  "#8B4513", // Saddle Brown / Rich Soil
  "#654321", // Dark Brown / Tree Bark
  "#5D4037", // Deep Earth Brown
  "#3E2723", // Very Dark Espresso
];

const GREEN_PRIMARY = window.getComputedStyle(document.body).getPropertyValue("--green-primary");
const GREEN_SECONDARY = window
  .getComputedStyle(document.body)
  .getPropertyValue("--green-secondary");

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
  const { ecoPointsBreakdown_thisWeek, totalWeekEcoPoints, weeklyEcoPoints, minDate, kpis } =
    await getUserStats(user);
  document.getElementById("loader").classList.toggle("hidden");
  document.querySelector("main").classList.toggle("hidden");

  console.log("ecoPointsBreakdown_thisWeek", ecoPointsBreakdown_thisWeek);

  for (const kpi in kpis) {
    document.querySelector(`#${kpi} .kpi-value`).textContent = kpis[kpi];
  }

  const donutCenterText = {
    id: "donutCenterText",
    beforeDatasetsDraw(chart, args, options) {
      const { ctx, data } = chart;
      const centerX = chart.getDatasetMeta(0).data[0].x;
      const centerY = chart.getDatasetMeta(0).data[0].y;
      ctx.save();

      ctx.font = "bolder 50px 'Arial', sans-serif";
      ctx.fillStyle = `black`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${totalWeekEcoPoints}`, centerX, centerY - 5);

      ctx.font = "normal 14px 'Arial', sans-serif";
      ctx.fillStyle = `#6c757d`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EcoPoints", centerX, centerY + 25);
    },
  };

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
            backgroundColor: COLOURS,
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "68%",
        maintainAspectRatio: false,
        devicePixelRatio: 2, // for some reason will be blurry without this
        plugins: {
          tooltip: {
            displayColors: true,
            callbacks: { label: (label) => `: ${label.formattedValue}🪙` },
          },
          title: { display: false },
          legend: { display: false },
        },
      },
      plugins: [donutCenterText],
    }
  );

  const weeklyEcoPointsChart = new Chart(document.getElementById("weekly-ecopoints-over-time"), {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Weekly EcoPoints",
          data: weeklyEcoPoints,
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
          color: `black`,
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
