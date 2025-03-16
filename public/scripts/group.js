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
                        // Add it to the groupUsers span
                        //document.getElementById("groupUsers").innerHTML += user.data().displayName + "\n";
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
        } );
}
displayGroupInfo();