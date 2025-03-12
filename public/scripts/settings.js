import { firebaseConfig } from "/config/auth.js";

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser; 

//should not be directly getting user data through client side, should be making fetch request to server side endpoint which retrieves user data/sets user data
function populateUserInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      //go to the correct user document by referencing to the user uid
      currentUser = db.collection("users").doc(user.uid);
      //get the document for current user.
      currentUser.get().then((userDoc) => {
        //Private Info

        //Personal Details
        let email = userDoc.data().email;
        let phoneNumber = userDoc.data().phoneNumber;
  
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

        //Public Info
        let bio = userDoc.data().bio;
        let displayName = userDoc.data().displayName;

        if (bio != null) {
          document.getElementById("bio").textContent = bio;
        }
        if (displayName != null) {
          document.getElementById("displayName").textContent = displayName;
        }

      });
    } else {
      // No user is signed in.
      console.log("No user is signed in");
    }
  });
}
populateUserInfo();

async function savePrivateInfo() {
  let _email = document.getElementById("email").value; //get the value of the field with id="schoolInput"
  let _phoneNumber = document.getElementById("phoneNumber").value; //get the value of the field with id="cityInput"
  let _street = document.getElementById("street").value;
  let _city = document.getElementById("city").value;
  let _province = document.getElementById("province").value;
  let _postalCode = document.getElementById("postalCode").value;

  const response = await fetch("/users/privateInfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: _email, phoneNumber: _phoneNumber, street : _street, city : _city, province : _province, postalCode : _postalCode }),
  });
  console.log(response);
}

async function savePublicInfo() {
  let _displayName = document.getElementById("displayName").value; 
  let _bio = document.getElementById("bio").value;

  const response = await fetch("/users/publicInfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: _displayName, bio: _bio }),
  });
  console.log(response);
}

//Edit public info
function editPublicInfo() {
  if (document.getElementById("editPublicInfo").textContent == "Edit") {
    document.querySelectorAll(".publicInfoField").forEach((input) => (input.disabled = false));
    document.getElementById("editPublicInfo").textContent = "Save";
  } else {
    document.querySelectorAll(".publicInfoField").forEach((input) => (input.disabled = true));
    document.getElementById("editPublicInfo").textContent = "Edit";
    savePublicInfo();
  }
}
document.getElementById("editPublicInfo").addEventListener("click", editPublicInfo);

//Edit private info
function editPrivateInfo() {
  if (document.getElementById("editPrivateInfo").textContent == "Edit") {
    document.querySelectorAll(".privateInfoField").forEach((input) => (input.disabled = false));
    document.getElementById("editPrivateInfo").textContent = "Save";
  } else {
    document.querySelectorAll(".privateInfoField").forEach((input) => (input.disabled = true));
    document.getElementById("editPrivateInfo").textContent = "Edit";
    savePrivateInfo();
  }
}
document.getElementById("editPrivateInfo").addEventListener("click", editPrivateInfo);
