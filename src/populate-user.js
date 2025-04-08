/**
 * Simulates completing random EcoActions for a user, adds entries to
 * their completedEcoActions subcollection, and updates the user's
 * main document with unique action and group IDs.
 * Assumes Firebase v8 SDK.
 *
 * @param {firebase.firestore.Firestore} db - The initialized Firestore database instance.
 * @param {object} firebase - The Firebase app object (needed for FieldValue).
 * @param {string} userID - The ID of the user document to update.
 * @param {number} [minCompletions=40] - Minimum number of completions to simulate.
 */
export default async function simulateCompletedActions(db, firebase, userID, minCompletions = 40) {
  console.log(`Starting simulation of ${minCompletions} completed actions for user ${userID}...`);

  const usersCollection = "users";
  const groupsCollection = "ecogroups";
  const actionsCollection = "ecoactions"; // We only need the IDs, but need groups to find them
  const completedSubcollection = "completedEcoActions";
  const userActionsField = "ecoActions"; // Field in user doc for completed action IDs
  const userGroupsField = "ecoGroups"; // Field in user doc for related group IDs

  try {
    // --- Step 1: Fetch all groups to map actions to groups and get all action IDs ---
    console.log("Fetching EcoGroups to map actions...");
    const groupsSnapshot = await db.collection(groupsCollection).get();

    const actionToGroupMap = new Map(); // Map<actionId, groupId>
    const allActionIds = []; // Array of all available action IDs

    groupsSnapshot.forEach((groupDoc) => {
      const groupId = groupDoc.id;
      const groupData = groupDoc.data();
      if (groupData.ecoactions && Array.isArray(groupData.ecoactions)) {
        groupData.ecoactions.forEach((actionId) => {
          if (!actionToGroupMap.has(actionId)) {
            // Avoid overwriting if action is in multiple groups (take first)
            actionToGroupMap.set(actionId, groupId);
          }
          allActionIds.push(actionId);
        });
      }
    });

    if (allActionIds.length === 0) {
      console.log("No EcoAction IDs found in any EcoGroups. Cannot simulate completions.");
      return;
    }
    console.log(`Found ${allActionIds.length} total possible action instances across groups.`);

    // --- Step 2: Randomly select EcoActions to "complete" ---
    const selectedActionIds = [];
    for (let i = 0; i < minCompletions; i++) {
      const randomIndex = Math.floor(Math.random() * allActionIds.length);
      selectedActionIds.push(allActionIds[randomIndex]);
    }
    console.log(`Randomly selected ${selectedActionIds.length} actions to complete.`);

    // --- Step 3 & 4: Prepare completion data and create documents concurrently ---
    const completedActionsRef = db
      .collection(usersCollection)
      .doc(userID)
      .collection(completedSubcollection);
    const completionPromises = [];

    const nowMs = Date.now();
    const tenWeeksMs = 10 * 7 * 24 * 60 * 60 * 1000;
    const tenWeeksAgoMs = nowMs - tenWeeksMs;

    selectedActionIds.forEach((actionId) => {
      // Generate random timestamp within the last 10 weeks
      const randomTimestampMs =
        Math.floor(Math.random() * (nowMs - tenWeeksAgoMs + 1)) + tenWeeksAgoMs;
      const firestoreTimestamp = firebase.firestore.Timestamp.fromMillis(randomTimestampMs);

      const completionData = {
        ecoActionID: actionId,
        timestamp: firestoreTimestamp,
      };

      // Add promise for creating the document
      completionPromises.push(completedActionsRef.add(completionData));
    });

    // Wait for all completion documents to be added
    console.log("Adding documents to completedEcoActions subcollection...");
    await Promise.all(completionPromises);
    console.log(`${completionPromises.length} completedEcoActions documents added.`);

    // --- Step 5: Update the User Document with unique Action and Group IDs ---
    // Get unique action IDs that were completed
    const uniqueCompletedActionIds = [...new Set(selectedActionIds)];

    // Get unique group IDs corresponding to the completed actions
    const uniqueGroupIds = new Set();
    uniqueCompletedActionIds.forEach((actionId) => {
      const groupId = actionToGroupMap.get(actionId);
      if (groupId) {
        uniqueGroupIds.add(groupId);
      } else {
        console.warn(`Could not find group mapping for completed action ID: ${actionId}`);
      }
    });
    const uniqueGroupIdsArray = [...uniqueGroupIds];

    console.log(
      `Updating user document ${userID} with ${uniqueCompletedActionIds.length} unique action IDs and ${uniqueGroupIdsArray.length} unique group IDs...`
    );

    const userDocRef = db.collection(usersCollection).doc(userID);

    // Update user doc using arrayUnion
    await userDocRef.update({
      [userActionsField]: firebase.firestore.FieldValue.arrayUnion(...uniqueCompletedActionIds),
      [userGroupsField]: firebase.firestore.FieldValue.arrayUnion(...uniqueGroupIdsArray),
    });

    console.log("------------------------------------------");
    console.log(`User ${userID} successfully updated.`);
    console.log(`Simulation complete.`);
    console.log("------------------------------------------");
  } catch (error) {
    console.error("------------------------------------------");
    console.error("Error during simulation of completed actions:", error);
    console.error("------------------------------------------");
  }
}

// --- How to Use ---
/*
  // Make sure you have initialized Firebase and have 'db' and 'firebase' available
  // Example initialization (replace with your actual config):
  // firebase.initializeApp(firebaseConfig);
  // const db = firebase.firestore();
  
  // Example user ID
  // const userIdToSimulate = "someUserId123";
  
  // Then call the simulation function:
  simulateCompletedActions(db, firebase, userIdToSimulate)
    .then(() => console.log("Simulation function finished."))
    .catch(err => console.error("Simulation function failed:", err));
  
  // To simulate a different number of completions:
  // simulateCompletedActions(db, firebase, userIdToSimulate, 50)
  */
