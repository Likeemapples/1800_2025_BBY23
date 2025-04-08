import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

const router = Router();
const WEEK_IN_MILLISECONDS = 6.048e8;
const NUM_WEEKS_TO_DISPLAY_IN_CHART = 4;

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

//TODO finish rearchictecting to minimize firebase db queries
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
    const userEcoActions = (await db.collection("users").doc(userID).get()).get("ecoactions");
    const allEcoActions = await getAllEcoActions();

    const completedEcoActionsCount = (await completedEcoActionsCollectionRef.get()).size;
    const ecoGroupsCount = (await db.collection("users").doc(userID).get()).get("ecogroups").length;

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

    const kpis = {
      "this-week-completed-ecoactions": totalWeekCompletedEcoActions ?? 0,
      "lifetime-ecopoints": 0,
      "lifetime-ecogroups": ecoGroupsCount,
      "lifetime-completed-ecoactions": completedEcoActionsCount ?? 0,
      "activity-streak": activityStreak ?? 0,
    };

    response.status(200).json({
      ecoPointsBreakdown_thisWeek,
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
    // completedEcoActionTimestamps.push({ ecoActionID, timestamp });

    if (!completedEcoActionDates[ecoActionID]) {
      completedEcoActionDates[ecoActionID] = [];
    }
    completedEcoActionDates[ecoActionID].push(date.toDate());
  });

  return completedEcoActionDates;
}

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

function formatWeeklyEcoPointSums(obj) {
  const formatted = [];

  for (const startDate in obj) {
    formatted.push({ x: startDate, y: obj[startDate] });
  }

  return formatted;
}

function populateRecentWeeksStartDates(currentWeekStart) {
  const weekStarts = {};
  for (let i = 9; i >= 0; i--) {
    const startDate = new Date(currentWeekStart.getTime() - i * WEEK_IN_MILLISECONDS);

    weekStarts[startDate.toISOString()] = 0;
  }

  return weekStarts;
}

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
