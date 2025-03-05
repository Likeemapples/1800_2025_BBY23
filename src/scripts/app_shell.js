fetch("/html/app_shell/footer.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(error => console.error("Error loading footer:", error));

fetch("/html/app_shell/nav_bar.html")
    .then(response => response.text())
    .then(data => document.getElementById("nav_bar").innerHTML = data)
    .catch(error => console.error("Error loading footer:", error));

fetch("/html/app_shell/head.html")
    .then(response => response.text())
    .then(data => document.getElementById("head").innerHTML = data)
    .catch(error => console.error("Error loading footer:", error));

fetch("/html/app_shell/footer-nav.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer-nav").innerHTML = data)
    .catch(error => console.error("Error loading footer-nav:", error));
