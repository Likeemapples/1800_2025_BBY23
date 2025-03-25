import { firebaseConfig } from "/config/auth.js";
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();



//Save user info
// function createNewGroup() {
//   console.log("ran");
//   firebase.auth().onAuthStateChanged((user) => {
//     var ref = db.collection("ecogroups");
//     const idToken = user.getIdToken(true);
//     ref.add({
//         name: document.getElementById("groupName").value,
//         users: [idToken]
//     });
//   });
// }

async function createRequest(user) {
  const idToken = await user.getIdToken(true);
  let _groupName = document.getElementById("groupName").value;

  try {
    const response = await fetch("/ecogroups/create", { //replace with desired endpoint
      method: "POST", // GET, POST, PUT, DELETE
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupName: _groupName,
        ecoActions: "n1tu9kWy6ZMR0fvYiKXN",
      }),
    });

    const docRef = await response.json();
    location.replace("group.html?docID=" + docRef.documentId);
  } catch (error) {
    console.error(error.name, error);
  }
}

function createNewGroup() {
  firebase.auth().onAuthStateChanged((user) => {
    createRequest(user);
  });
}

document.getElementById("createGroupButton").addEventListener("click", createNewGroup);
