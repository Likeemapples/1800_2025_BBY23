// Get the checkmark SVG element
const checkmarkElement = document.getElementById('checkmark');

// Add an event listener for when the animation ends
checkmarkElement.addEventListener('animationend', function () {
    console.log("Animation ended!");  // Debugging line to ensure the animationend is firing
    
    // Add a slight delay before redirecting to ensure animation has finished
    setTimeout(function() {
        window.location.href = "/html/dailyChallenges.html";  // Redirect after a slight delay
    }, 1000);  // Delay in milliseconds (500ms or 0.5 seconds)
});

// Optional: Check if the animation is applied
checkmarkElement.addEventListener('animationstart', function () {
    console.log("Animation started!");  // Debugging line to ensure animation starts
});
