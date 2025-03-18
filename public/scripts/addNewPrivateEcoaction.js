document.addEventListener("firebaseReady", function () {


  async function addEcoAction(user) {
    let _title = document.getElementById("title").value;
    let _description = document.getElementById("description").value
    let _shortDescription = document.getElementById("shortDescription").value;
   
    let _bannerImage =  document.getElementById("imagePreview").src;

    if (!_title || !_description || !_shortDescription || !_bannerImage ) {
      alert("You must fill all of the fields before submitting.");
      return; // Stop function execution
    }
  
    const idToken = await user.getIdToken(true);
  
    const response = await fetch("/users/ecoaction", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        title: _title, 
        description: _description, 
        shortDescription: _shortDescription,
        bannerImage : _bannerImage
      })
    });
    
    // 🔹 Log the raw response
    const rawText = await response.text();
    console.log(rawText);
    window.location.href = "/html/dailyChallenges.html";  // Redirect after a slight delay

  }
  


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

function saveEcoAction()
{
  firebase.auth().onAuthStateChanged((user) => {
    addEcoAction(user);
  });
}
//   document.getElementById("finishEcoAction").addEventListener("click", finishEcoAction);
document.getElementById("bannerImage").addEventListener("change", previewImage);

document.getElementById("saveEcoAction").addEventListener("click", saveEcoAction);
});