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
window.addEventListener('resize', function() {
  let allCardBodies = document.querySelectorAll('.card-body');
  
  allCardBodies.forEach(cardBody => {
    if (cardBody.style.maxHeight && cardBody.style.maxHeight !== "0px") {
      // Adjust the maxHeight dynamically when the window resizes
      let fullHeight = cardBody.scrollHeight;
      cardBody.style.maxHeight = fullHeight + "px"; // Recalculate height on resize
    }
  });
});


async function displayChallengesDynamically(user) {

  const idToken = await user.getIdToken(true);

  const response = await fetch("/users/test1", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const userInfo = await response.json();
  console.log("Server Response JSON:", userInfo);
  
  if (!userInfo.success) {
    throw new Error(`Error fetching user data: ${userInfo.message}`);
  }
  
  let cardTemplate = document.getElementById("challengeTemplate"); // Retrieve the HTML element with the ID "challengeTemplate"
  
  const ecoactions = userInfo.ecoActions; // Assuming `ecoActions` is the key that holds the user's ecoaction data.
  
  if (ecoactions && ecoactions.length > 0) {
    ecoactions.forEach(doc => {
      const completed = doc.data.completed;
      const title = doc.data.title; 
      const description = doc.data.description; 
      const shortDescription = doc.data.shortDescription; 

      // Clone the card template and populate it with data
      let newcard = cardTemplate.content.cloneNode(true);
      newcard.querySelector('.title').innerHTML = title;
      newcard.querySelector('.description').innerHTML = description;
      newcard.querySelector('.shortDescription').innerHTML = shortDescription;
      let cardHead = newcard.querySelector('.card-header');
      cardHead.addEventListener("click", function() {
        toggleCollapse(cardHead);
      });
  
      // If needed, you can use the 'completed' data to modify the card (e.g., add a class, change text, etc.)
      if (completed) {
        newcard.querySelector('.card').classList.add('completed'); // Example: Add 'completed' class to card if completed.
      }
  
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