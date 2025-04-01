import express, { Router } from "express";
import { db, admin } from "../config/firebase.js";

const router = Router();
const WEEK_IN_MILLISECONDS = 6.048e8;
const NUM_WEEKS_TO_DISPLAY_IN_CHART = 3;

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
    const completedEcoActionTimestamps = await getCompletedEcoActionTimestamps(
      completedEcoActionsCollectionRef
    );
    const userEcoActions = (await db.collection("users").doc(userID).get()).get("ecoactions");
    const allRequiredEcoActions = getRelevantEcoActions([
      ...userEcoActions,
      ...completedEcoActionTimestamps
        .filter((ecoAction) => ecoAction.timestamp.toDate() >= minDate)
        .map((ecoaction) => ecoaction.ecoActionID),
    ]);

    const completedEcoActionsCount = (await completedEcoActionsCollectionRef.get()).size;
    const ecogroupsCount = (await db.collection("users").doc(userID).collection("ecogroups").get())
      .size;

    //a collection of uniqe doc ids, each representing a completed ecoaction with an ecoactionID and timestamp

    const { missedEcoActionsCount_lifetime, missedEcoActionsCount_thisWeek } =
      await calcMissedEcoActions(
        userEcoActions,
        completedEcoActionsCollectionRef,
        currentWeekStart
      );

    const minDate = new Date(
      currentWeekStart.getTime() - NUM_WEEKS_TO_DISPLAY_IN_CHART * WEEK_IN_MILLISECONDS
    );
    console.log("minDate", minDate);

    const weeklyEcoPoints = await calcWeeklyEcoPoints(
      completedEcoActionTimestamps,
      currentWeekStart,
      minDate
    );
    console.log("weeklyEcoPoints", weeklyEcoPoints);

    const kpis = {
      "this-week-ecopoints": 0,
      "this-week-missed-ecoactions": missedEcoActionsCount_thisWeek,
      "this-week-completed-ecoactions": 0,
      "lifetime-ecopoints": 0,
      "lifetime-missed-ecoactions": missedEcoActionsCount_lifetime,
      "lifetime-completed-ecoactions": completedEcoActionsCount,
    };

    response.status(200).json({
      ecogroupsCount,
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

async function getCompletedEcoActionTimestamps(collectionRef) {
  const completedEcoActionTimestamps = [];
  const querySnapshot = await collectionRef.get();

  querySnapshot.forEach((doc) => {
    const { ecoActionID, timestamp } = doc.data();
    completedEcoActionTimestamps.push({ ecoActionID, timestamp });
  });

  return completedEcoActionTimestamps;
}

/**
 * Given an array of document IDs, fetches the corresponding ecoactions from the "ecoactions" collection
 * and returns an object mapping each ecoaction ID to its ecoPoints value.
 * @param {string[]} docIds - Array of ecoaction IDs to fetch
 * @returns {Object.<string,number>} - ecoaction ID to ecoPoints value mapping
 */
async function getRelevantEcoActions(docIds) {
  const ecoActions = {};
  const ecoActionsCollectionRef = db.collection("ecoactions");
  const querySnapshot = await ecoActionsCollectionRef
    .where(admin.firestore.FieldPath.documentId(), "in", docIds)
    .get();

  querySnapshot.forEach((doc) => {
    ecoActions[doc.id] = doc.data().ecoPoints;
  });

  return ecoActions;
}

//TODO
async function calcWeeklyEcoPoints(completedEcoActionTimestamps, currentWeekStart, minDate) {
  const weeklyEcoPointsSums = populateRecentWeeksStartDates(currentWeekStart);
  const recentCompletedEcoActionTimestamps = completedEcoActionTimestamps.filter(
    (ecoAction) => ecoAction.timestamp.toDate() >= minDate
  );
  const relevantEcoActions = await getRelevantEcoActions(
    recentCompletedEcoActionTimestamps.map((ecoaction) => ecoaction.ecoActionID)
  );

  for (const completedEcoAction of recentCompletedEcoActionTimestamps) {
    const weekStart = getWeekStart(timestamp.toDate()).toISOString();
    const currentSum = weeklyEcoPointsSums[weekStart] || 0;

    weeklyEcoPointsSums[weekStart] =
      currentSum + relevantEcoActions[completedEcoAction.ecoActionID];
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

//TODO
async function calcMissedEcoActions(
  userEcoActions,
  completedEcoActionsCollectionRef,
  currentWeekStart
) {
  let missedEcoActionsCount_lifetime = 0;
  let missedEcoActionsCount_thisWeek = 0;

  for (const docID of userEcoActions) {
    const requiredDays = (await db.collection("ecoactions").doc(docID).get()).get("requiredDays");
    const completedEcoActionDates = (
      await completedEcoActionsCollectionRef.where("ecoActionID", "==", docID).get()
    ).docs.map((doc) => doc.get("timestamp").toDate());

    //iterate through each day of the week in each ecoaction and see if there is a corresponding completedEcoActioDaten entry
    //if there is not, increment the missedEcoActionsCount
    missedEcoActionsCount_lifetime += requiredDays.reduce((total, day) => {
      const found = completedEcoActionDates.some((date) => date.getDay() == day);
      return total + (found ? 0 : 1);
    }, 0);

    missedEcoActionsCount_thisWeek += requiredDays.reduce((total, day) => {
      const found = completedEcoActionDates.some(
        (date) => date.getDay() == day && date >= currentWeekStart
      );
      return total + (found ? 0 : 1);
    }, 0);
  }

  return { missedEcoActionsCount_lifetime, missedEcoActionsCount_thisWeek };
}

export default router;
