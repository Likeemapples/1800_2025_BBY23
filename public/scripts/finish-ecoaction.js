document.addEventListener("firebaseReady", function () {
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("postDescription");
  const imageInput = document.getElementById("image");
  const submitBtn = document.getElementById("finishBtn");

  function checkFields() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const image = imageInput.files.length > 0;

    submitBtn.disabled = !(title && description && image);
  }

  titleInput.addEventListener("input", checkFields);
  descriptionInput.addEventListener("input", checkFields);
  imageInput.addEventListener("change", checkFields);

  const ecoActionToFinish = localStorage.getItem("ecoactionToFinish");

  async function displayEcoaction(user) {
    const ecoActioReponse = await fetch("/ecoactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        EcoactionsIDs: ecoActionToFinish,
      },
    });
    const responseData = await ecoActioReponse.json();
    const ecoactionsDocs = responseData.ecoactionsDocs;
    console.log(ecoactionsDocs);

    let doc = ecoactionsDocs[0];

    const name = doc.name;
    const description = doc.description;
    const shortDescription = doc.shortDescription;
    const ecoPoints = doc.ecoPoints;
    const bannerImage = doc.bannerImage;

    if (bannerImage != null && bannerImage != "") {
      analyzeImageBrightness(bannerImage);
      document.getElementById("bannerImage").style.backgroundImage = `url('${bannerImage}')`;
    } else {
      analyzeImageBrightness("/assets/images/image-not-found.jpg");
      document.getElementById(
        "bannerImage"
      ).style.backgroundImage = `url("/assets/images/image-not-found.jpg")`;
    }

    if (ecoPoints != null) {
      document.getElementById("ecoPoints").innerText = ecoPoints;
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

  async function deleteEcoaction(user) {
    const idToken = await user.getIdToken(true);

    fetch("/users/ecoaction", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        ecoactionID: ecoActionToFinish, // The ID you want to remove
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  }

  async function postEcoaction(user) {
    let _title = titleInput.value;
    let _description = descriptionInput.value;
    let _image = imageInput.files.length > 0 ? imageInput.files[0] : null;

    const idToken = await user.getIdToken(true);

    const response = await fetch("/users/complete-ecoaction", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: _image,
        title: _title,
        description: _description,
        ecoactionID: ecoActionToFinish,
      }),
    });

    const result = await response.json().catch(() => null);
    console.log("Response status:", response.status);
    console.log("Response body:", result);
  }

  document.getElementById("finishBtn").addEventListener("click", (event) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        await deleteEcoaction(user);
        await postEcoaction(user);
        localStorage.removeItem("ecoactionToFinish");
        window.location.href = "/html/finish-animation.html";
      }
    });
  });
});

function previewImage(event) {
  const imagePreview = document.getElementById("imagePreview");

  const file = event.target.files[0];
  if (file) {
    imagePreview.hidden = false;
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block"; // Show the image preview
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById("image").addEventListener("change", previewImage);

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

      let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      brightnessSum += brightness;
    }

    let averageBrightness = brightnessSum / totalPixels;

    let textColor = averageBrightness < 128 ? [255, 255, 255] : [0, 0, 0]; // RGB Array
    let rgbaTextColor = `rgb(${textColor[0]}, ${textColor[1]}, ${textColor[2]})`;

    console.log(averageBrightness);
    let opacity = 0.2;
    let backgroundColor = averageBrightness > 128 ? [255, 255, 255] : [0, 0, 0]; // RGB Array
    let rgbabackgroundColor = `rgba(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]}, ${opacity})`;

    document.getElementById("bannerImage").style.color = rgbaTextColor;

    document.documentElement.style.setProperty("--custom-color", rgbabackgroundColor);
  };
}
