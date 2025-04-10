# EcoAction Project

## Overview

EcoAction is a web application designed to connect environmentally conscious individuals and empower them to make a tangible impact through collective action. The app facilitates this by providing users with "EcoActions," which are small, achievable challenges that can be completed individually or in groups. EcoAction aims to combat the feeling of isolation in environmental efforts by enabling users to track their contributions, connect with others, and visualize their progress.

Developed for the COMP1800 Projects 1 and Web Development courses, EcoAction utilizes a SCRUM methodology with weekly sprints, leveraging technologies like Firebase for backend services, and JavaScript for dynamic front-end functionality.

---

## Names of Contributors

- Jason
- Hazel
- Yehor

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

Visit the Welcome page:
1. Open your browser and visit `http://localhost:8050`.
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

Example:

```
project-name/
├── src/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── components/
├── package.json
├── README.md
└── .gitignore
```

---

## Acknowledgments

Example:

- Weather data sourced from [OpenWeatherMap](https://openweathermap.org/).
- Code snippets for \_\_\_ algoirthm were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---

## Limitations and Future Work

### Limitations

Example:

- Currently, the app only supports city-based weather searches.
- Limited to basic weather parameters like temperature, humidity, and conditions.
- The user interface can be further enhanced for accessibility.

### Future Work

Example:

- Add support for location-based weather detection using GPS.
- Implement additional weather parameters like wind speed and UV index.
- Create a dark mode for better usability in low-light conditions.
- Integrate user accounts for saving favorite locations.

---

## License

Example:
This project is licensed under the MIT License. See the LICENSE file for details.
