function loadScript(src) {
  return new Promise((resolve, reject) => {
      let script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
  });
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
      const { getAuth, signOut } = await import("firebase/auth");

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

fetch("/html/app_shell/footer.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(error => console.error("Error loading footer:", error));

fetch("/html/app_shell/nav_bar.html")
    .then(response => response.text())
    .then(data => document.getElementById("nav_bar").innerHTML = data)
    .catch(error => console.error("Error loading nav-bar:", error));

fetch("/html/app_shell/head.html")
    .then(response => response.text())
    .then(data => document.getElementById("head").innerHTML = data)
    .catch(error => console.error("Error loading header:", error));

fetch("/html/app_shell/footer-nav.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer-nav").innerHTML = data)
    .catch(error => console.error("Error loading footer-nav:", error));





    
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
      
      
        const profileImage = userInfo.imageBase64; 
      
      
        if (profileImage !== null && profileImage !== "") {
          console.log("navBarProfileImage", profileImage);
          document.getElementsByClassName("navBarProfileImage")[0].src = profileImage;
        }
    }
    
    document.addEventListener("firebaseReady", function () {

    firebase.auth().onAuthStateChanged((user) => {
        populateUserInfo(user);
      });
    });

    document.addEventListener("firebaseReady", () => {
      const logoutBtn = document.getElementById("logoutButton");
  
      if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
              const auth = getAuth();
              signOut(auth)
                  .then(() => {
                      console.log("User logged out successfully");
                      window.location.href = "/html/login.html"; // Redirect to login page
                  })
                  .catch((error) => {
                      console.error("Error logging out:", error);
                  });
          });
      }