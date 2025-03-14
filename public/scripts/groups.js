import { firebaseConfig } from "/config/auth.js";
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("groupCardTemplate"); 

    db.collection(collection).get() 
        .then(allGroups=> {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allGroups.forEach(docu => { //iterate thru each doc
                
                var title = docu.data().name;
                var details = docu.data().details;
                var groupMembers = docu.data().users.length;

                // db.collection("users").doc(docu.data().users[0]).get().then(snapshot=> {
                //     console.log(snapshot.data().displayName);
                // });
                
                var docID = docu.id;
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
                

                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-members').innerHTML = groupMembers + " members";
                newcard.querySelector('.card-text').innerHTML = details;
                // newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg
                newcard.querySelector('a').href = "eachHike.html?docID="+docID;

                //Optional: give unique ids to all elements for future use
                // newcard.querySelector('.card-title').setAttribute("id", "ctitle" + i);
                // newcard.querySelector('.card-text').setAttribute("id", "ctext" + i);
                // newcard.querySelector('.card-image').setAttribute("id", "cimage" + i);

                //attach to gallery, Example: "hikes-go-here"
                document.getElementById("groups-go-here").appendChild(newcard);

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}

displayCardsDynamically("ecogroups");  //input param is the name of the collection