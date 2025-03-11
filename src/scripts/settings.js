import { firebaseConfig } from "./auth.js";

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {

                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                     


                            //Personal Details
                            let email = userDoc.data().email;
                            let displayName = userDoc.data().displayName;
                            let phoneNumber = userDoc.data().phoneNumber;

                            if (displayName != null) {
                                document.getElementById("displayName").value = displayName;
                            }
                            if (email != null) {
                                document.getElementById("email").value = email;
                            }
                            if (phoneNumber != null) {
                                document.getElementById("phoneNumber").value = phoneNumber;
                            }

                            //Address
                            let street = userDoc.data().street;
                            let city = userDoc.data().city;
                            let province = userDoc.data().province;
                            let postalCode = userDoc.data().postalCode;

                            if (street != null) {
                                document.getElementById("street").value = street;
                            }
                            if (city != null) {
                                document.getElementById("city").value = city;
                            }
                            if (province != null) {
                                document.getElementById("province").value = province;
                            }
                            if (postalCode != null) {
                                document.getElementById("postalCode").value = postalCode;
                            }

                            //Public Details
                            if (displayName != null) {
                                document.getElementById("publicName").textContent = displayName;
                            }
                            if (email != null) {
                                document.getElementById("publicEmail").textContent = email;
                            }
                            if (about != null) {
                                document.getElementById("postalCode").value = postalCode;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            });
        }

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
   // document.getElementById('personalInfoFields').disabled = false;
 }

 function saveUserInfo() {
    let _displayName = document.getElementById('displayName').value;       //get the value of the field with id="nameInput"
    let _email = document.getElementById('email').value;     //get the value of the field with id="schoolInput"
    let _phoneNumber = document.getElementById('phoneNumber').value;       //get the value of the field with id="cityInput"
    let _street = document.getElementById('street').value;  
    let _city = document.getElementById('city').value;  
    let _province = document.getElementById('province').value;  
    let _postalCode = document.getElementById('postalCode').value;  

    currentUser.update({
        displayName: _displayName,
        email: _email,
        phoneNumber: _phoneNumber,
        street: _street,
        city: _city,
        province: _province,
        postalCode: _postalCode
    })
    .then(() => {
        console.log("Document successfully updated!");
    })
    //document.getElementById('personalInfoFields').disabled = true;
}
document.getElementById("update").addEventListener("click", saveUserInfo);
