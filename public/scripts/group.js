import { firebaseConfig } from "/config/auth.js";
const db = firebase.firestore();






function displayGroupInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"

    // In this ecogroup
    db.collection( "ecogroups" )
        .doc( ID )
        .get()
        .then( doc => {
            let hikeName = doc.data().name;
            // Loop through all users
            let userList = doc.data().users;
            userList.forEach( userID => {
                // For each user in this group
                db.collection( "users" )
                    .doc( userID )
                    .get()
                    .then( user => {
                        try {
                            document.getElementById("groupUsers").innerHTML += user.data().displayName + "\n";
                        } catch (err) {
                            // Delete nonexistent userId from list
                        }
                    });
            });            
            // Set groupName span
            document.getElementById("groupName").innerHTML = hikeName;
            // TODO: display current groupGoal
            let actionList = doc.data().ecoaction;
            actionList.forEach( actionID => {
                let cardTemplate = document.getElementById("challengeTemplate"); 
                db.collection( "ecoactions" ).doc(actionID).get().then( actionDoc => {
                    const name = actionDoc.data().name; 
                    const description = actionDoc.data().description;
                    const points = actionDoc.data().ecoPoints;
            
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
                            selectAction(actionDoc.id);
                        });
                    }
                    //toggleCollapse(cardHead);
                    document.getElementById("groupActions").appendChild(newcard);
                });
            });
    });
}
displayGroupInfo();


async function addUser(user) {
    let params = new URL( window.location.href );
    let ID = params.searchParams.get( "docID" );
    const idToken = await user.getIdToken(true);

    try {
        const response = await fetch("/ecogroups/add-user", { //replace with desired endpoint
            method: "PUT", // GET, POST, PUT, DELETE
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                groupID: ID,
            }),
        });
    } catch (error) {
        console.error(error.name, error);
    }
}
document.getElementById("join-group").addEventListener("click", function() {
    firebase.auth().onAuthStateChanged((user) => {
        addUser(user);
    });
});