const db = firebase.firestore();
import { searchCollection } from "./search.js";

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
async function displayCardsDynamically(collectionName) {
  let params = new URL(window.location.href);
  let ID = params.searchParams.get("search");
  let cardTemplate = document.getElementById("groupCardTemplate");
  const df = document.createDocumentFragment();
  const groupsGoHere = document.getElementById("groups-go-here");
  const loader = document.getElementById("loader");
  const mainContent = document.querySelector("main");

  groupsGoHere.innerHTML = "";

  try {
    if (ID == null) {
      const querySnapshot = await db.collection(collectionName).get();

      const cardPromises = querySnapshot.docs.map(async (doc) => {
        const groupData = doc.data();
        console.log("groupData", groupData);

        var title = groupData.name || "No Title";
        var groupMembers = groupData.users ? groupData.users.length : 0;
        var docID = doc.id;
        var action = "No Action Assigned";

        if (groupData.ecoactions && groupData.ecoactions.length > 0) {
          try {
            const ecoactionDoc = await db
              .collection("ecoactions")
              .doc(groupData.ecoactions[0])
              .get();
            if (ecoactionDoc.exists) {
              action = ecoactionDoc.data().name || "Unnamed Action";
            } else {
              action = "Action Not Found";
            }
          } catch (ecoError) {
            console.error(
              `Error fetching ecoaction ${groupData.ecoactions[0]} for group ${docID}:`,
              ecoError
            );
            action = "Error loading action";
          }
        }

        let newcard = cardTemplate.content.cloneNode(true);
        newcard.querySelector(".card-title").innerHTML = title;
        newcard.querySelector(".card-members").innerHTML = groupMembers + " members";
        newcard.querySelector(".card-text").innerHTML = action;
        newcard.querySelector("a").href = "group.html?docID=" + docID;
        return newcard; // Return the card element from the async map function
      });

      // Wait for all card creation promises to resolve
      const cards = await Promise.all(cardPromises);
      cards.forEach((card) => df.appendChild(card)); // Append resolved cards

      if (querySnapshot.empty) {
        groupsGoHere.innerHTML = "No Groups Found";
      }
    } else {
      // --- Fetch documents based on search ID ---
      const ids = await searchCollection(collectionName, ID);

      if (ids.length > 0) {
        // Use Promise.all to fetch documents and their ecoactions concurrently
        const cardPromises = ids.map(async (docId) => {
          try {
            const docSnapshot = await db.collection(collectionName).doc(docId).get();

            if (docSnapshot.exists) {
              // Check if the document exists
              const groupData = docSnapshot.data();
              var title = groupData.name || "No Title";
              var groupMembers = groupData.users ? groupData.users.length : 0;
              var action = "No Action Assigned";

              if (groupData.ecoactions && groupData.ecoactions.length > 0) {
                try {
                  const ecoactionDoc = await db
                    .collection("ecoactions")
                    .doc(groupData.ecoactions[0])
                    .get();
                  if (ecoactionDoc.exists) {
                    action = ecoactionDoc.data().name || "Unnamed Action";
                  } else {
                    action = "Action Not Found";
                  }
                } catch (ecoError) {
                  console.error(
                    `Error fetching ecoaction ${groupData.ecoactions[0]} for group ${docId}:`,
                    ecoError
                  );
                  action = "Error loading action";
                }
              }

              let newcard = cardTemplate.content.cloneNode(true);
              newcard.querySelector(".card-title").innerHTML = title;
              newcard.querySelector(".card-members").innerHTML = groupMembers + " members";
              newcard.querySelector(".card-text").innerHTML = action;
              newcard.querySelector("a").href = "group.html?docID=" + docId;
              return newcard; // Return the card element
            } else {
              console.warn(`Document with ID ${docId} not found.`);
              return null; // Return null if doc doesn't exist
            }
          } catch (docError) {
            console.error(`Error fetching document ${docId}:`, docError);
            return null; // Return null on error fetching the doc
          }
        });

        const cards = (await Promise.all(cardPromises)).filter((card) => card !== null);
        cards.forEach((card) => df.appendChild(card));

        if (cards.length === 0 && ids.length > 0) {
          groupsGoHere.innerHTML = "Groups found by search, but unable to load details.";
        }
      } else {
        groupsGoHere.innerHTML = "No Results Found for your Search";
      }
    }

    groupsGoHere.appendChild(df);
  } catch (error) {
    console.error("Error displaying cards:", error);
    groupsGoHere.innerHTML = "An error occurred while loading groups."; // Show error message
  } finally {
    loader.classList.toggle("hidden");
    mainContent.classList.toggle("hidden");
  }
}

// Assuming searchCollection is defined elsewhere and returns a Promise<string[]>
// async function searchCollection(collectionName, searchTerm) { ... }

displayCardsDynamically("ecogroups");

function searchButtonClick() {
  let destination = document.getElementById("search-bar").value;
  location.replace("groups.html?search=" + destination);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick);
