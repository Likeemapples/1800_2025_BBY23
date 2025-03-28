import { firebaseConfig } from "/config/auth.js";

const db = firebase.firestore();
import { searchCollection } from "./search.js";

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("groupCardTemplate"); 

    db.collection(collection).get().then(allGroups=> {
        allGroups.forEach( docu => {
            
            var title = docu.data().name;
            var action = "";
            db.collection( "ecoactions" ).doc(docu.data().ecoaction[0]).get().then( doc => {
                action = doc.data().name;
                var groupMembers = docu.data().users.length;
                var docID = docu.id;
                let newcard = cardTemplate.content.cloneNode(true);
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-members').innerHTML = groupMembers + " members";
                newcard.querySelector('.card-text').innerHTML = action;
                newcard.querySelector('a').href = "group.html?docID="+docID;
                document.getElementById("groups-go-here").appendChild(newcard);
            });
        })
    })
}

displayCardsDynamically( "ecogroups" );

console.log(searchCollection("ecogroups", "bikers"));