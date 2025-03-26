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

var selectedAction = "";

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
        ecoAction: selectedAction,
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


function toggleCollapse(header) {
  let cardBody = header.nextElementSibling; // Get the next sibling, which is the .card-body

  if (cardBody.style.maxHeight && cardBody.style.maxHeight !== "0px") {
    // Collapse the card
    cardBody.style.maxHeight = "0";
    cardBody.style.padding = "0 15px"; // Remove padding when collapsing
    cardBody.style.contentVisibility = "hidden";

  } else {
    // Expand the card
    cardBody.style.contentVisibility = "visible";
    let fullHeight = cardBody.scrollHeight + 30; // Add small buffer for smoothness
    cardBody.style.maxHeight = fullHeight + "px";
    cardBody.style.padding = "15px"; // Restore padding
  }
}



function selectAction(ID) {
  selectedAction = ID;
  db.collection( "ecoactions" ).doc( ID ).get().then( doc => {
    document.getElementById("selectedAction").placeholder = "Selected EcoAction: " + doc.data().name;
  });
  
}

async function displayEcoActions() {
  let cardTemplate = document.getElementById("challengeTemplate"); 
  db.collection( "ecoactions" ).get().then( allActions => {
    allActions.forEach( doc => {
      const name = doc.data().name; 
      const description = doc.data().description;
      const points = doc.data().ecoPoints;

      let newcard = cardTemplate.content.cloneNode(true);
      newcard.querySelector("#title").innerHTML = name;
      newcard.querySelector("#description").innerHTML = description;
      newcard.querySelector("#points").innerHTML = points;


      let cardHead = newcard.querySelector(".card-header");
      cardHead.addEventListener("click", function () {
        toggleCollapse(cardHead);
      });

      let finishButton = newcard.querySelector(".finishEcoactionButton"); 
      if (finishButton) {
        finishButton.addEventListener("click", function () {
          selectAction(doc.id);
        });
      }
      //toggleCollapse(cardHead);
      document.getElementById("ecoactions-here").appendChild(newcard);
        
    });
  });
}
displayEcoActions();