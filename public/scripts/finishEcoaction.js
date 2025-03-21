// import { firebaseConfig } from "/config/auth.js";

// firebase.initializeApp(firebaseConfig);

// Function to preview the image once selected



document.addEventListener("firebaseReady", function () {
  async function displayEcoaction(user) {


    const ecoactionToFinish = localStorage.getItem("ecoactionToFinish");
    console.log(ecoactionToFinish); 


    const ecoActioReponse = await fetch(`/ecoactions?ecoactionsIDs=${ecoactionToFinish}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseData = await ecoActioReponse.json();
    const ecoactionsDocs = responseData.ecoactionsDocs;
    console.log(ecoactionsDocs);

    let doc = ecoactionsDocs[0];

    const name = doc.name; 
    const description = doc.description;
    const shortDescription = doc.shortDescription;
    const points = doc.points;
    const bannerImage = doc.bannerImage;

    if (bannerImage != null) {
      analyzeImageBrightness(bannerImage);
      document.getElementById("bannerImage").style.backgroundImage = `url('${bannerImage}')`;
    }
    if (points != null) {
      document.getElementById("points").innerText = points;
    }
    if (name != null) {
      document.getElementById("name").innerText = name;
    }
    if (shortDescription != null) {
      document.getElementById("shortDescription").innerText = shortDescription;
    }
    if (description != null) {
      document.getElementById("description").innerText = description;
    }
  }

  displayEcoaction();
});
  
function previewImage(event) {
  const imagePreview = document.getElementById('imagePreview');

  const file = event.target.files[0];
  if (file) {
    imagePreview.hidden = false;
      const reader = new FileReader();
      reader.onload = function(e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block'; // Show the image preview
      };
      reader.readAsDataURL(file);
  }
}

document.getElementById("imageInput").addEventListener("change", previewImage);


function analyzeImageBrightness(imageUrl) {
  let img = new Image();
  img.crossOrigin = "Anonymous"; // To prevent CORS issues
  img.src = imageUrl;

  img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      let imageData = ctx.getImageData(0, 0, img.width, img.height);
      let data = imageData.data;

      let brightnessSum = 0;
      let totalPixels = data.length / 4; // RGBA groups

      for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Luminance formula: (0.299 * R) + (0.587 * G) + (0.114 * B)
          let brightness = (0.299 * r + 0.587 * g + 0.114 * b);
          brightnessSum += brightness;
      }

      let averageBrightness = brightnessSum / totalPixels;

      // If brightness is low, make text white; otherwise, make it black
      let textColor = averageBrightness < 128 ? "white" : "black";
      document.getElementById("bannerImage").style.color = textColor;
  };
}
