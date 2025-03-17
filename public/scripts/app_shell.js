function loadScript(src) {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

try {
  const footerResponse = await fetch("/html/app_shell/footer.html");
  const footerData = await footerResponse.text();
  document.getElementById("footer").innerHTML = footerData;
} catch (error) {
  console.log(`${error.name} loading footer`, error);
}

try {
  const navBarResponse = await fetch("/html/app_shell/nav_bar.html");
  const navBarData = await navBarResponse.text();
  document.getElementById("nav_bar").innerHTML = navBarData;
} catch (error) {
  console.log(`${error.name} loading nav bar`, error);
}

try {
  const headResponse = await fetch("/html/app_shell/head.html");
  const headData = await headResponse.text();
  document.head.innerHTML = headData;
} catch (error) {
  console.log(`${error.name} loading head shell`, error);
}

try {
  const footerNavResponse = await fetch("/html/app_shell/footer-nav.html");
  const footerNavData = await footerNavResponse.text();
  document.getElementById("footer-nav").innerHTML = footerNavData;
} catch (error) {
  console.log(`${error.name} loading footer nav`, error);
}

(async function loadScripts() {
  try {
    await loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js");
    await loadScript("https://www.gstatic.com/firebasejs/ui/4.8.1/firebase-ui-auth.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js");

    console.log("All Firebase scripts loaded.");

    // Import Firebase config and initialize

    const { firebaseConfig } = await import("/config/auth.js");

    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized.");

    // Ensure auth state listener is set after Firebase is initialized
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        populateUserInfo(user);
      }
    });
    document.dispatchEvent(new Event("firebaseReady"));
  } catch (error) {
    console.error("Failed to load a script:", error);
  }
})();

async function populateUserInfo(user) {
  const idToken = await user.getIdToken(true);

  const response = await fetch("/users/info", {
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

  const profileImage = userInfo.profileImage;

  if (profileImage) {
    console.log("navBarProfileImage", profileImage);
    const elements = document.getElementsByClassName("navBarProfileImage");

    Array.from(elements).forEach((element) => {
      element.src = profileImage; // Pass the function reference, not the result of calling it
    });
  }
}

// Your logout function
function logout() {
  // Call Firebase sign out
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Logging out user");
      window.location.href = "/html/index.html"; // Redirect AFTER logout completes
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

// Add event listeners to all buttons with the "signOut" class
const signOutButtons = document.querySelectorAll(".signOut");
signOutButtons.forEach((button) => {
  button.addEventListener("click", logout);
});
