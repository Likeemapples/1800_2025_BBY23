# EcoAction Project

## Overview

EcoAction is a web application designed to connect environmentally conscious individuals and empower them to make a tangible impact through collective action. The app facilitates this by providing users with "EcoActions," which are small, achievable challenges that can be completed individually or in groups. EcoAction aims to combat the feeling of isolation in environmental efforts by enabling users to track their contributions, connect with others, and visualize their progress.

Developed for the COMP1800 Projects 1 and Web Development courses, EcoAction utilizes a SCRUM methodology with weekly sprints, leveraging technologies like Firebase for backend services, and JavaScript for dynamic front-end functionality.

---

## Names of Contributors

- Jason
- Hazel
- Yehor Skudilov

---

## Contact 
* Yehor Skudilov - yskudilov@my.bcit.ca 

---

## Features

-   **EcoActions:** Users can view and complete a variety of environmentally friendly tasks.
-   **EcoGroups:** Users can form or join groups to collaborate on EcoActions and track collective progress.
-   **User Profiles:** Users can create profiles to track their individual contributions and connect with others.
-   **Statistics and Visualization:** The app provides charts and graphs to visualize user progress and impact.
-   **Authentication:** Secure user authentication using Firebase.

---

## Technologies Used

-   **Communication:** Discord
-   **Project Management:** Trello
-   **Frontend:** HTML5, CSS, SCSS, SASS, Bootstrap, JavaScript
-   **Backend:** NodeJS, ExpressJS
-   **Database:** Firebase (Firestore)
-   **Image Storage:** Cloudinary
-   **Charting Library:** ChartJS
-   **Live Reloading:** LiveReload
-   **Backend Auto-Restart:** Nodemon
-   **IDE:** VSCode
-   **AI Assistance:** ChatGPT (for logo and assets)
-   **Version Control:** Git
-   **Repository Hosting:** GitHub
-   **UI/UX Design:** Figma
-   **Hosting:** Contabo VPS running Linux (Ubuntu)

---

## Usage

Run the web-app
1. Go to the 1800_2025_BBY23 directory
2. Open the directory in terminal
3. Run the fillowing command to start the aplication
```
node app.js
```

Visit the Welcome page:
1. Open your browser and visit 
```
http://localhost:8050
```
2. You will be welcomed with the landng page that shows what our app does.

User Registration:
1. From the Welcome page (index) click a big button “Get Started”.
2. Now either use google or enter your email, password, and name and click save. 
3. You will be redirected to home page of the app.

Editing Profile:
1. On desktop click the profile image on the top navbar or an icon with one person on the mobile.
2. There you will see your details. The page is divided into two sections: “Public Profile”(Everyone will see this) and “Private information”.
3. To edit any of the fields click edit button at the bottom of the corresponding section.
4. When you are done click save. Your info will be updated and saved.

Joining a group:
1. On desktop click the EcoGroups tab on the top navbar or an icon with two people on the mobile.
2. You will see the list of EcoGroups and now you can either search for a specific one or choose the one you like from the list and click ”See More”.
3. You will see ecoactions that the group contains and users that joined the group.
4. On the top you can click the join group button to join the group and get the group's Ecoactions.
5. Now you will be a memeber of the group and the group's EcoActions will be added to your EcoActions page. 

Finishing EcoActions:
1. On desktop click the EcoActions tab on the top navbar or an icon with a checkmark in a circle on the mobile.
2. You will see the list of all EcoActions from all EcoGroups that you joined. 
3. You can click on any of them to expand and see a full description and the banner.
4. If you want to finish the EcoAction click the finish button.
5. You will be redirected to a page where you can upload a proof image, give your post a title, and write a description. When you are done click finish.
6. Now the post will be saved and EcoPoints will be added to your account.

Seeing your statistics:
1. On desktop click the Stats tab on the top navbar or an icon that looks like a line graph on the mobile.
2. On this page you will see many interesting graphs, each grouped in different categories.

Creating a group:
1. On desktop click the EcoGroups tab on the top navbar or an icon with two people on the mobile.
2. At the top of the page you will see a button “Create New”, click it.
3. Now enter the group’s name and choose the ecoaction your group will have.
4. When you are done click the “Create Group” button.
5. Now you will see your newly created group.
6. You will be automatically added as the user and now everyone can join your group.

---

## Project Structure

```
1800_2025_BBY23
├── .gitattributes
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── public
│   ├── assets
│   │   ├── chart-simple-solid.svg
│   │   ├── ecoaction.svg
│   │   ├── ecopoints1.png
│   │   ├── ecopoints2.png
│   │   ├── file(1).svg
│   │   ├── images
│   │   │   ├── 000_17D62L.jpg
│   │   │   ├── 2A563CF5-ADAF-4B46-A452-CC8520972AD7-1180x885.jpg
│   │   │   ├── AM01.jpg
│   │   │   ├── BBY01.jpg
│   │   │   ├── blog_x-impressive-tree-planting-organizations-exceeding-expectations.jpg
│   │   │   ├── coin.png
│   │   │   ├── ecoaction.ico
│   │   │   ├── hike1.jpg
│   │   │   ├── hike2.jpg
│   │   │   ├── hike3.jpg
│   │   │   ├── image-not-found.jpg
│   │   │   ├── login-bg.jpg
│   │   │   ├── logo.svg
│   │   │   ├── park-clean-up.jpg
│   │   │   └── profile-icon.png
│   │   ├── logo.png
│   │   └── logo2.png
│   ├── html
│   │   ├── 404.html
│   │   ├── app-shell
│   │   │   ├── footer-nav.html
│   │   │   ├── footer.html
│   │   │   ├── head.html
│   │   │   └── nav-bar.html
│   │   ├── ecoactions.html
│   │   ├── finish-animation.html
│   │   ├── finish-ecoaction.html
│   │   ├── group-creation.html
│   │   ├── group.html
│   │   ├── groups.html
│   │   ├── help.html
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── my-groups.html
│   │   ├── profile-public.html
│   │   ├── profile.html
│   │   └── stats.html
│   ├── scripts
│   │   ├── app-shell.js
│   │   ├── ecoactions.js
│   │   ├── finish-animation.js
│   │   ├── finish-ecoaction.js
│   │   ├── finisher-header.es5.min.js
│   │   ├── group-creation.js
│   │   ├── group.js
│   │   ├── groups.js
│   │   ├── index.js
│   │   ├── load-component.js
│   │   ├── login.js
│   │   ├── my-groups.js
│   │   ├── profile.js
│   │   ├── sample-request.js
│   │   ├── search.js
│   │   └── stats.js
│   └── styles
│       ├── app-shell
│       │   ├── app-shell.css
│       │   ├── footer-navbar.css
│       │   ├── footer.css
│       │   └── navbar.css
│       ├── ecoactions.css
│       ├── finish-animation.css
│       ├── finish-ecoaction.css
│       ├── groups.css
│       ├── index.css
│       ├── loader.css
│       ├── login.css
│       ├── profile-public.css
│       ├── profile.css
│       ├── stats.css
│       └── theme.css
├── README.md
└── src
    ├── config
    │   ├── auth-template.js
    │   ├── auth.js
    │   ├── cloudinary.js
    │   └── firebase.js
    ├── populate-firestore.js
    ├── populate-user.js
    └── routes
        ├── ecoactions.js
        ├── ecogroups.js
        ├── stats.js
        └── users.js
```

---

## Acknowledgments

Example:

- Weather data sourced from [OpenWeatherMap](https://openweathermap.org/).
- Code snippets for \_\_\_ algoirthm were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---

## Limitations and Future Work

###   Limitations

-   Group EcoActions functionality is still under development.
-   The page currently labeled "EcoGroups" should be the "Explore" page.
-   The intended EcoGroups page (a list of joined groups) is not implemented.
-   Some UX/UI bugs need to be addressed.
-   Leaderboards feature is not yet implemented.
-   Finished EcoActions do not disappear from the EcoActions list as intended.
-   Groups lack administration features.
-   The group interface lacks features like chat and viewing group posts.
-   Users cannot leave groups.
-   Users cannot create custom EcoActions specifically for a group.
-   EcoPoints are only displayed on the Stats page and not readily visible elsewhere.
-   The EcoActions page lacks a "Completed EcoActions" section to display finished actions sorted by date.
-   The Profile page has a section for statistics (like EcoPoints and groups joined) that is currently non-functional and hardcoded.
-   There is no functionality for users to view the profiles of other users.

###   Future Work

-   Complete group EcoActions functionality.
-   Rename the page currently labeled "EcoGroups" to "Explore" and implement the intended Explore page functionality.
-   Implement the EcoGroups page to display a list of groups the user has joined.
-   Finalize the Explore page with robust search and filtering.
-   Implement the leaderboards feature for enhanced gamification.
-   Conduct further usability testing and address UX/UI issues.
-   Refine the user interface for improved user experience.
-   Add mobile navbar text labels for better usability.
-   Ensure consistent styling and navigation across all pages.
-   Implement the feature where finished EcoActions disappear from the EcoActions list for a day.
-   Implement recurring EcoActions with frequencies set by the group.
-   Add group administration features (e.g., managing members, settings).
-   Improve the group interface with features like a group chat, the ability to view group posts, and more detailed group information.
-   Implement the ability for users to leave groups.
-   Implement the ability for users to create and suggest custom EcoActions for their groups.
-   Add a widget to the top navbar to display the user's EcoPoints.
-   Add a "Completed EcoActions" section to the EcoActions page to display finished actions sorted by date.
-   Implement the functionality to correctly display user statistics on the Profile page.
-   Implement the ability for users to view the profiles of other users.
