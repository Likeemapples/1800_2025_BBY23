import { firebaseConfig } from "/config/auth.js";
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const groupNameElement = document.getElementById("groupName");
const groupUsersElement = document.getElementById("groupUsers");
const groupActionsElement = document.getElementById("groupActions");
const challengeTemplate = document.getElementById("challengeTemplate");
const loader = document.getElementById("loader");
const mainContent = document.querySelector("main");
const joinGroupButton = document.getElementById("join-group");

/**
 * Fetches and displays group information, users, and actions.
 * Manages loading state and errors.
 */
async function displayGroupInfo() {
  let params = new URL(window.location.href);
  let ID = params.searchParams.get("docID");

  if (!ID) {
    console.error("No Group ID (docID) found in URL.");
    groupNameElement.textContent = "Group Not Found";
    loader.classList.toggle("hidden");
    mainContent.classList.toggle("hidden");
    return;
  }
  groupNameElement.textContent = "";
  groupUsersElement.innerHTML = "";
  groupActionsElement.innerHTML = "";

  try {
    const groupDoc = await db.collection("ecogroups").doc(ID).get();

    if (!groupDoc.exists) {
      console.error(`Group with ID ${ID} not found.`);
      groupNameElement.textContent = "Group Not Found";
      return; // Exit early
    }

    const groupData = groupDoc.data();
    const groupName = groupData.name || "Unnamed Group"; // Default name

    groupNameElement.textContent = groupName;

    const userList = groupData.users || []; // Default to empty array if undefined
    if (userList.length > 0) {
      const userPromises = userList.map((userID) => db.collection("users").doc(userID).get());
      const userSnapshots = await Promise.all(userPromises);

      let userHtmlContent = ""; // Build user list string/HTML
      userSnapshots.forEach((userSnap) => {
        if (userSnap.exists) {
          userHtmlContent += (userSnap.data().displayName || "Unknown User") + "<br>";
        } else {
          console.warn(`User document for ID ${userSnap.id} not found.`);
        }
      });
      groupUsersElement.innerHTML = userHtmlContent || "No users found in this group.";
    } else {
      groupUsersElement.textContent = "No users listed for this group.";
    }

    const actionList = groupData.ecoactions || [];
    if (actionList.length > 0) {
      const actionPromises = actionList.map((actionID) =>
        db.collection("ecoactions").doc(actionID).get()
      );
      const actionSnapshots = await Promise.all(actionPromises);
      const actionsFragment = document.createDocumentFragment();

      actionSnapshots.forEach((actionDoc) => {
        if (actionDoc.exists && challengeTemplate) {
          const actionData = actionDoc.data();
          const name = actionData.name || "Unnamed Action";
          const description = actionData.description || "No description.";
          const points = actionData.ecoPoints || 0;

          let newcard = challengeTemplate.content.cloneNode(true);
          newcard.querySelector("#title").textContent = name; // Use textContent for safety
          newcard.querySelector("#description").textContent = description;
          newcard.querySelector("#points").textContent = points;

          let cardHead = newcard.querySelector(".card-header");
          if (cardHead && typeof toggleCollapse === "function") {
            cardHead.addEventListener("click", () => toggleCollapse(cardHead));
          }

          let finishButton = newcard.querySelector(".finishEcoactionButton");
          if (finishButton && typeof selectAction === "function") {
            finishButton.addEventListener("click", () => selectAction(actionDoc.id));
          }

          actionsFragment.appendChild(newcard);
        } else if (!actionDoc.exists) {
          console.warn(`Ecoaction document for ID ${actionDoc.id} not found.`);
        }
      });
      groupActionsElement.appendChild(actionsFragment); // Append all cards at once
    } else {
      groupActionsElement.textContent = "No challenges assigned to this group.";
    }
  } catch (error) {
    console.error("Error fetching group details:", error);
    groupNameElement.textContent = "Error Loading Group";
    groupUsersElement.textContent = "Could not load user list.";
    groupActionsElement.textContent = "Could not load challenges.";
  } finally {
    loader.classList.toggle("hidden");
    mainContent.classList.toggle("hidden");
  }
}

displayGroupInfo();

async function addUser(user) {
  let params = new URL(window.location.href);
  let ID = params.searchParams.get("docID");
  if (!user || !ID) {
    console.error("User not logged in or Group ID missing for join action.");
    return;
  }

  const idToken = await user.getIdToken(true);

  try {
    const addUserToGroupPromise = fetch("/ecogroups/add-user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupID: ID,
      }),
    });

    const addGroupToUserPromise = fetch("/users/ecogroup", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ecoGroupID: ID,
      }),
    });

    const addEcoActionsToUserPromise = fetch("/users/ecoaction", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ecoGroupID: ID,
      }),
    });

    const [addUserToGroupResponse, addGroupToUserResponse, addEcoActionsToUserResponse] =
      await Promise.all([addUserToGroupPromise, addGroupToUserPromise, addEcoActionsToUserPromise]);

    if (addGroupToUserResponse.ok && addUserToGroupResponse.ok && addEcoActionsToUserResponse.ok) {
      console.log("Successfully joined group (according to backend).");
      window.location.reload();
    } else {
      console.error("Backend reported an error joining group:");
    }
  } catch (error) {
    console.error("Network or other error during fetch:", error);
  }
  location.reload();
}

if (joinGroupButton) {
  joinGroupButton.addEventListener("click", function () {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        addUser(user);
      } else {
        console.log("User must be logged in to join.");
      }
    });
  });
}
