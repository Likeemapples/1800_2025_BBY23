import { firebaseConfig } from "/config/auth.js";
const app = firebase.initializeApp(firebaseConfig);
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
                // console.log("Run");
                db.collection( "ecoactions" )
                    .doc( actionID )
                    .get()
                    .then( action => {
                        // console.log(action);
                        try {
                            let act = action.data();
                            // console.log(act);
                            document.getElementById("groupActions").innerHTML += act.ecoPoints + " | " + act.name + "\n";
                        } catch (err) {
                            // Delete nonexistent actionID from list
                            console.error(err);
                        }
                });

            });
    } );
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