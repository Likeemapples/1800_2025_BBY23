import { firebaseConfig } from "/config/auth.js";
document.getElementById("displayName").textContent = "displayName";

firebase.initializeApp(firebaseConfig);

//Get user info
async function populateUserInfo(user) {
  const idToken = await user.getIdToken(true);


  const response = await fetch("/users/info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const userInfo = await response.json();
  console.log("Server Response JSON:", userInfo);

  if (!userInfo.success) {
    throw new Error(`Error fetching user data: ${userInfo.message}`);
  }


  const userData = await userInfo.data;

  let email = userData.email;
  let phoneNumber = userData.phoneNumber;

  if (email != null) {
    document.getElementById("email").value = email;
  }
  if (phoneNumber != null) {
    document.getElementById("phoneNumber").value = phoneNumber;
  }

  //Address
  let street = userData.street;
  let city = userData.city;
  let province = userData.province;
  let postalCode = userData.postalCode;

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
  let bio = userData.bio;
  let displayName = userData.displayName;
  if (bio != null) {
    document.getElementById("bio").value = bio;
  }
  if (displayName != null) {
    document.getElementById("displayName").value = displayName;
  }
}
firebase.auth().onAuthStateChanged((user) => {
  populateUserInfo(user);
});

//Save user info
async function savePrivateInfo(user) {
  let _email = document.getElementById("email").value; //get the value of the field with id="schoolInput"
  let _phoneNumber = document.getElementById("phoneNumber").value; //get the value of the field with id="cityInput"
  let _street = document.getElementById("street").value;
  let _city = document.getElementById("city").value;
  let _province = document.getElementById("province").value;
  let _postalCode = document.getElementById("postalCode").value;

  const idToken = await user.getIdToken(true);

  const response = await fetch("/users/privateInfo", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: _email, phoneNumber: _phoneNumber, street : _street, city : _city, province : _province, postalCode : _postalCode }),
  });
  console.log(response);
}

async function savePublicInfo(user) {
  let _displayName = document.getElementById("displayName").value; 
  let _bio = document.getElementById("bio").value;

  const idToken = await user.getIdToken(true);

  const response = await fetch("/users/publicInfo", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: _displayName, bio: _bio})
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
    firebase.auth().onAuthStateChanged((user) => {
      savePublicInfo(user);
    });  }
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
    firebase.auth().onAuthStateChanged((user) => {
      savePrivateInfo(user);
    });
  }
}
document.getElementById("editPrivateInfo").addEventListener("click", editPrivateInfo);



