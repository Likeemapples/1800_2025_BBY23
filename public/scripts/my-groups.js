import { firebaseConfig } from "/config/auth.js";

const db = firebase.firestore();
import { searchCollection } from "./search.js";

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
async function displayCardsDynamically(collection) {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "search" ); //get value for key "id"
    let cardTemplate = document.getElementById("groupCardTemplate"); 

    if (ID == null) {

        db.collection( collection ).get().then( allGroups=> {
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
    } else {
        const ids = await searchCollection(collection, ID);
        for (var i = 0; i < ids.length; i++) {
            db.collection( collection ).doc( ids[i] ).get().then( docu => {
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
            });
        }
        if (ids.length <= 0) {
            document.getElementById("groups-go-here").innerHTML = "No Results";
        }
    }
}

displayCardsDynamically( "users" );


function searchButtonClick() {
    let destination = document.getElementById("search-bar").value;
    location.replace("groups.html?search=" + destination);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick); 