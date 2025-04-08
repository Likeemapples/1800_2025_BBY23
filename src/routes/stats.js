import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

const router = Router();
const WEEK_IN_MILLISECONDS = 6.048e8;
const NUM_WEEKS_TO_DISPLAY_IN_CHART = 6;

async function authenticateToken(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).send("Unauthorized: No token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    response.status(401).send("Unauthorized: Invalid token");
  }
}

router.get("/", authenticateToken, async (request, response) => {
  const currentWeekStart = getWeekStart(new Date());
  const { uid: userID } = request.user;
  console.log("userID", userID);

  try {
    const completedEcoActionsCollectionRef = db
      .collection("users")
      .doc(userID)
      .collection("completedEcoActions");

    const completedEcoActionDates = await getCompletedEcoActionDates(
      completedEcoActionsCollectionRef
    );
    const userEcoActions = (await db.collection("users").doc(userID).get()).get("ecoActions");
    const allEcoActions = await getAllEcoActions();

    const lifetimeEcoActions = (await completedEcoActionsCollectionRef.get()).size;
    const ecoGroupsCount = (await db.collection("users").doc(userID).get()).get(
      "ecoGroups"
    )?.length;

    // const { missedEcoActionsCount_lifetime, missedEcoActionsCount_thisWeek } =
    //   await calcMissedEcoActions(
    //     userEcoActions,
    //     allEcoActions,
    //     completedEcoActionDates,
    //     currentWeekStart
    //   );

    const minDate = new Date(
      currentWeekStart.getTime() - NUM_WEEKS_TO_DISPLAY_IN_CHART * WEEK_IN_MILLISECONDS
    );

    //change to promise.all

    const weeklyEcoPoints = await calcWeeklyEcoPoints(
      allEcoActions,
      completedEcoActionDates,
      currentWeekStart,
      minDate
    );

    const {
      ecoPointsBreakdown_thisWeek,
      totalWeekEcoPoints,
      totalWeekCompletedEcoActions,
      activityStreak,
    } = await getThisWeekEcoPointsBreakdown(
      completedEcoActionsCollectionRef,
      currentWeekStart,
      allEcoActions
    );

    const { lifetimeEcoPoints, breakdown: completedEcoActionsByCategory } = await calcLifetimeKPIs(
      allEcoActions,
      completedEcoActionDates
    );

    const kpis = {
      "this-week-completed-ecoactions": totalWeekCompletedEcoActions ?? 0,
      "lifetime-ecopoints": lifetimeEcoPoints ?? 0,
      "lifetime-ecogroups": ecoGroupsCount ?? 0,
      "activity-streak": activityStreak ?? 0,
    };

    response.status(200).json({
      ecoPointsBreakdown_thisWeek,
      completedEcoActionsByCategory,
      lifetimeEcoActions,
      totalWeekEcoPoints,
      weeklyEcoPoints,
      minDate,
      kpis,
    });
  } catch (error) {
    console.log(`${error.name} getting user stats for user ${userID}`, error);
    response
      .status(500)
      .json({ message: `${error.name} getting user stats for user ${userID}`, error });
  }
});

async function calcLifetimeKPIs(ecoActions, completedEcoActions) {
  const breakdown = {};
  let lifetimeEcoPoints = 0;

  for (const ecoAction in completedEcoActions) {
    const { category, ecoPoints } = ecoActions[ecoAction];

    breakdown[category] = (breakdown[category] || 0) + ecoPoints;
    lifetimeEcoPoints += ecoPoints;
  }

  return { lifetimeEcoPoints, breakdown };
}

async function getThisWeekEcoPointsBreakdown(
  completedEcoActionsCollectionRef,
  currentWeekStart,
  allEcoActions
) {
  const breakdown = {};
  const querySnapshot = await completedEcoActionsCollectionRef
    .where("timestamp", ">=", currentWeekStart)
    .get();
  let totalWeekEcoPoints = 0;
  let totalWeekCompletedEcoActions = 0;
  let days = [];
  let activityStreak = 0;

  querySnapshot.forEach((doc) => {
    const { ecoActionID, timestamp } = doc.data();
    const { name: ecoActionName, ecoPoints } = allEcoActions[ecoActionID];

    days.push(timestamp.toDate().getDay());

    if (breakdown[ecoActionName]) {
      breakdown[ecoActionName] += ecoPoints;
    } else {
      breakdown[ecoActionName] = ecoPoints;
    }

    totalWeekEcoPoints += ecoPoints;
    totalWeekCompletedEcoActions++;
  });

  // calc activity streak starting from monday
  days = [...new Set(days)];
  days.sort((a, b) => a - b);
  let prevDay = 0;
  for (const day of days) {
    console.log("day", day);

    if (prevDay + 1 == day) {
      activityStreak++;
    }
    prevDay++;
  }

  return {
    ecoPointsBreakdown_thisWeek: breakdown,
    totalWeekEcoPoints,
    totalWeekCompletedEcoActions,
    activityStreak,
  };
}

/**
 * Fetches all completed ecoactions from a user's 'completedEcoActions' collection
 * and returns an object with the ecoaction IDs as keys and an array of
 * corresponding timestamps as the value.
 *
 * @param {import('firebase-admin').firestore.CollectionReference} collectionRef
 * The 'completedEcoActions' collection reference of the user.
 * @return {Object.<string, Array.<Date>>} The completed ecoactions
 * grouped by ecoaction ID.
 */
async function getCompletedEcoActionDates(collectionRef) {
  const completedEcoActionDates = {};
  const querySnapshot = await collectionRef.get();

  querySnapshot.forEach((doc) => {
    const { ecoActionID, timestamp: date } = doc.data();
    console.log("doc data", doc.data());

    if (!completedEcoActionDates[ecoActionID]) {
      completedEcoActionDates[ecoActionID] = [];
    }
    completedEcoActionDates[ecoActionID].push(date.toDate());
  });

  return completedEcoActionDates;
}

/**
 * Fetches all ecoactions from the 'ecoactions' collection and returns an object
 * with the ecoaction IDs as keys and their corresponding data as the value.
 *
 * @return {Object.<string, import('firebase-admin').firestore.DocumentData>} The
 *     ecoactions
 */
async function getAllEcoActions() {
  const ecoActions = {};
  const ecoActionsCollectionRef = db.collection("ecoactions");
  const querySnapshot = await ecoActionsCollectionRef.get();

  querySnapshot.forEach((doc) => {
    ecoActions[doc.id] = doc.data();
  });

  return ecoActions;
}

async function calcWeeklyEcoPoints(
  allEcoActions,
  completedEcoActionDates,
  currentWeekStart,
  minDate
) {
  const weeklyEcoPointsSums = populateRecentWeeksStartDates(currentWeekStart);
  const recentCompletedEcoActionDates = Object.fromEntries(
    Object.entries(completedEcoActionDates).map(([id, dates]) => [
      id,
      dates.filter((date) => date >= minDate),
    ])
  );

  for (const completedEcoAction in recentCompletedEcoActionDates) {
    const weekStarts = recentCompletedEcoActionDates[completedEcoAction].map((date) =>
      getWeekStart(date)
    );

    for (const weekStart of weekStarts) {
      const stringWeekStart = weekStart.toISOString();
      weeklyEcoPointsSums[stringWeekStart] += allEcoActions[completedEcoAction].ecoPoints;
    }
  }

  return formatWeeklyEcoPointSums(weeklyEcoPointsSums);
}

/**
 * Formats an object with weekly EcoPoints sums into an array of objects
 * suitable for the x-axis of a chart.
 *
 * @param {Object.<string, number>} obj
 *     An object with weekly EcoPoints sums.
 * @return {Array.<{x: string, y: number}>} The formatted data.
 */
function formatWeeklyEcoPointSums(obj) {
  const formatted = [];

  for (const startDate in obj) {
    formatted.push({ x: startDate, y: obj[startDate] });
  }

  return formatted;
}

/**
 * Populates an object with the past 10 weeks' start dates as keys
 * and initializes their values to 0.
 *
 * @param {Date} currentWeekStart
 *     The current week's start date.
 * @return {Object.<string, number>}
 *     An object with weekly start dates as keys and initial values of 0.
 */
function populateRecentWeeksStartDates(currentWeekStart) {
  const weekStarts = {};
  for (let i = 9; i >= 0; i--) {
    const startDate = new Date(currentWeekStart.getTime() - i * WEEK_IN_MILLISECONDS);

    weekStarts[startDate.toISOString()] = 0;
  }

  return weekStarts;
}

/**
 * Returns the start date of the week for a given date.
 *
 * @param {Date} date
 *     The date to find the week start date for.
 * @return {Date}
 *     The week start date.
 */
function getWeekStart(date) {
  // avoid mutating original date
  const newDate = new Date(date);
  const day = newDate.getDay();
  const weekStartDate = new Date(newDate.setDate(newDate.getDate() - day + (day == 0 ? -6 : 1)));

  weekStartDate.setHours(0, 0, 0, 0);

  return weekStartDate;
}

//this is super complicated for not that much value. put aside for now
async function calcMissedEcoActions(
  userEcoActions,
  allEcoActions,
  completedEcoActionDates,
  currentWeekStart
) {
  let missedEcoActionsCount_lifetime = 0;
  let missedEcoActionsCount_thisWeek = 0;

  for (const docID of userEcoActions) {
    const { requiredDays } = allEcoActions[docID];

    //iterate through each day of the week in each ecoaction and see if there is a corresponding completedEcoActioDaten entry
    //if there is not, increment the missedEcoActionsCount
    missedEcoActionsCount_lifetime += requiredDays.reduce((total, day) => {
      const found = Object.values(completedEcoActionDates)
        .flat()
        .some((date) => date.getDay() == day);
      return total + (found ? 0 : 1);
    }, 0);

    missedEcoActionsCount_thisWeek += requiredDays.reduce((total, day) => {
      const found = Object.values(completedEcoActionDates)
        .flat()
        .some((date) => date.getDay() == day && date >= currentWeekStart);
      return total + (found ? 0 : 1);
    }, 0);

    console.log("missedEcoActionsCount_lifetime", missedEcoActionsCount_lifetime);
    console.log("missedEcoActionsCount_thisWeek", missedEcoActionsCount_thisWeek);
  }

  return { missedEcoActionsCount_lifetime, missedEcoActionsCount_thisWeek };
}

export default router;
