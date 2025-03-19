document.addEventListener("firebaseReady", function () {
  function toggleCollapse(header) {
    let cardBody = header.nextElementSibling; // Get the next sibling, which is the .card-body

    if (cardBody.style.maxHeight && cardBody.style.maxHeight !== "0px") {
      // Collapse the card
      cardBody.style.maxHeight = "0";
      cardBody.style.padding = "0 15px"; // Remove padding when collapsing
    } else {
      // Expand the card
      let fullHeight = cardBody.scrollHeight + 30; // Add small buffer for smoothness
      cardBody.style.maxHeight = fullHeight + "px";
      cardBody.style.padding = "15px"; // Restore padding
    }
  }



  // Adding event listener for window resize to adjust maxHeight dynamically
  window.addEventListener("resize", function () {
    let allCardBodies = document.querySelectorAll(".card-body");

    allCardBodies.forEach((cardBody) => {
      if (cardBody.style.maxHeight && cardBody.style.maxHeight !== "0px") {
        // Adjust the maxHeight dynamically when the window resizes
        let fullHeight = cardBody.scrollHeight;
        cardBody.style.maxHeight = fullHeight + "px"; // Recalculate height on resize
      }
    });
  });

  async function displayChallengesDynamically(user) {
    const idToken = await user.getIdToken(true);

    const response = await fetch("/users/ecoactions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });
    const userInfo = await response.json();


    let cardTemplate = document.getElementById("challengeTemplate"); 

    const ecoactions = userInfo.ecoActions; 

    if (ecoactions && ecoactions.length) {
      const ecoactionsIDs = ecoactions.map(id => encodeURIComponent(id)).join("&");

        const ecoActioReponse = await fetch(`/ecoactions?ecoactionsIDs=${ecoactionsIDs}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await ecoActioReponse.json();
        const ecoactionsDocs = responseData.ecoactionsDocs;
        console.log(ecoactionsDocs);

        ecoactionsDocs.forEach( async(doc) => {
          const name = doc.name; 
          const ecoactionID = doc.id; 
          const description = doc.description;
          const shortDescription = doc.shortDescription;
          const points = doc.points;

      

      const bannerImageResponse = await fetch(`/users/ecoactionBanner?ecoactionID=${ecoactionID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!bannerImageResponse.ok) {
        throw new Error(`HTTP error! Status: ${bannerImageResponse.status}`);
      }

      const bannerImageData = await bannerImageResponse.json();
      console.log("Server Response JSON:", bannerImageData);

      if (!bannerImageData.success) {
        throw new Error(`Error fetching user data: ${bannerImageData.message}`);
      }

      // Clone the card template and populate it with data
      let newcard = cardTemplate.content.cloneNode(true);
      newcard.querySelector(".title").innerHTML = name;
      newcard.querySelector(".description").innerHTML = description;
      newcard.querySelector(".shortDescription").innerHTML = shortDescription;
      newcard.querySelector(".points").innerHTML = points;

      // Assign the correct image URL
      newcard.querySelector(".bannerImage").src = bannerImageData.bannerImage || "default-image.jpg"; 


        let cardHead = newcard.querySelector(".card-header");
        cardHead.addEventListener("click", function () {
          toggleCollapse(cardHead);
        });

        // Append the new card to the DOM
        document.getElementById("dailyChallenges-go-here").appendChild(newcard);
      });
    } else {
      console.log("No ecoactions found for this user.");
    }
  }

  firebase.auth().onAuthStateChanged((user) => {
    displayChallengesDynamically(user);
  });
});
