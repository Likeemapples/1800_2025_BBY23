import { firebaseConfig } from "/config/auth.js";

firebase.initializeApp(firebaseConfig);

// Function to preview the image once selected
function previewImage(event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; // Show the image preview
        };
        reader.readAsDataURL(file);
    }
}

async function sumbitEcoAction(user) {
    // let _displayName = document.getElementById("displayName").value; 
    // let _bio = document.getElementById("bio").value;
  console.log("submitting eco action");
    const idToken = await user.getIdToken(true);
  
    // const response = await fetch("/users/ecoaction", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${idToken}`,
    //     "Content-Type": "application/json",
    //   },
    //    body: JSON.stringify({ displayName: "_displayName", bio: "_bio"})
    // });
    // console.log(response);

    try {
        const response = await fetch("/users/ecoaction", {
          //replace with desired endpoint
          method: "PUT", // GET, POST, PUT, DELETE
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ecoactionID: "test",
          }),
        });
        console.log("response", response);
      } catch (error) {
        console.error(error.name, error);
      }
    
  }

  function finishEcoAction() {
    console.log("submitting eco action");

    firebase.auth().onAuthStateChanged((user) => {
        sumbitEcoAction(user);
        // window.location.href = "/html/finishAnimation.html";  // Redirect after a slight delay

    });
  }

//   document.getElementById("finishEcoAction").addEventListener("click", finishEcoAction);
document.getElementById("imageInput").addEventListener("change", previewImage);
