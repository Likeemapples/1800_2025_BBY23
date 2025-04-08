/**
 * Seeds the Firestore database with predefined EcoGroups and EcoActions,
 * using auto-generated IDs for both collections. Includes categories for actions.
 * Assumes Firebase v8 SDK.
 *
 * @param {firebase.firestore.Firestore} db - The initialized Firestore database instance.
 * @param {object} firebase - The Firebase app object (needed for FieldValue).
 */
export default async function seedDatabase(db, firebase) {
  console.log("Starting database seeding with auto-generated IDs and categories...");

  // --- Data Definitions (Added 'category' to each action) ---
  const groupsData = [
    // 1. Biking Group
    {
      group: {
        name: "Cycle Commuters Collective",
        description:
          "For enthusiasts who choose pedals over petrol for their daily commute. Share tips, routes, and motivate each other to complete biking-related EcoActions.",
      },
      actions: [
        {
          category: "Transportation", // Added Category
          name: "Bike To Work",
          description:
            "Swap your car or public transport for your bicycle for your commute to work or school at least once this week.",
          ecoPoints: 50,
          shortDescription: "Commute via bicycle at least once this week.",
        },
        {
          category: "Transportation", // Added Category
          name: "Weekend Warrior Ride",
          description:
            "Go for a recreational bike ride of at least 10km (6.2 miles) over the weekend.",
          ecoPoints: 30,
          shortDescription: "Take a 10km+ bike ride this weekend.",
        },
        {
          category: "Consumption & Lifestyle", // Added Category (related to maintenance/repair)
          name: "Bike Maintenance Check",
          description:
            "Perform basic bike maintenance: check tire pressure, clean the chain, and ensure brakes are working.",
          ecoPoints: 15,
          shortDescription: "Perform basic bike maintenance.",
        },
      ],
    },
    // 2. Waste Reduction Group
    {
      group: {
        name: "Zero Waste Warriors",
        description:
          "Dedicated to minimizing personal waste. Join us to tackle challenges like packing waste-free lunches and mastering the art of composting.",
      },
      actions: [
        {
          category: "Waste Reduction", // Added Category
          name: "Waste-Free Lunch",
          description:
            "Pack and eat a lunch that generates zero single-use waste (use reusable containers, cutlery, napkins, and water bottles). Do this 3 times this week.",
          ecoPoints: 40,
          shortDescription: "Pack a zero-waste lunch 3 times this week.",
        },
        {
          category: "Waste Reduction", // Added Category
          name: "Compost Starter",
          description:
            "Set up or contribute to a compost system (home bin, worm farm, local drop-off) for your food scraps for one week.",
          ecoPoints: 60,
          shortDescription: "Start or use a compost system for one week.",
        },
      ],
    },
    // 3. Energy Saving Group
    {
      group: {
        name: "Energy Savers United",
        description:
          "Focused on reducing household energy consumption. Let's work together on turning off lights and hunting down energy vampires.",
      },
      actions: [
        {
          category: "Energy Conservation", // Added Category
          name: "Lights Out Challenge",
          description:
            "Make a conscious effort to turn off lights in rooms when you leave them for an entire day.",
          ecoPoints: 15,
          shortDescription: "Turn off lights when leaving rooms for a day.",
        },
        {
          category: "Energy Conservation", // Added Category
          name: "Unplug Energy Vampires",
          description:
            "Identify and unplug electronics that draw power even when off (like chargers, TVs, game consoles) when not in use for a day.",
          ecoPoints: 20,
          shortDescription: "Unplug idle electronics for a day.",
        },
      ],
    },
    // 4. Water Conservation Group
    {
      group: {
        name: "Water Wise Crew",
        description:
          "Committed to conserving water resources. Take on shorter showers and become a leak detective in your home.",
      },
      actions: [
        {
          category: "Water Conservation", // Added Category
          name: "Shorter Shower Sprint",
          description:
            "Time your shower and aim to reduce it by at least 2 minutes compared to your usual time. Do this twice this week.",
          ecoPoints: 35,
          shortDescription: "Reduce shower time by 2+ minutes, twice.",
        },
        {
          category: "Water Conservation", // Added Category
          name: "Leak Detective",
          description:
            "Check all faucets, toilets, and exposed pipes in your home for leaks. Report or fix any leaks found.",
          ecoPoints: 45,
          shortDescription: "Check your home for water leaks and fix/report.",
        },
      ],
    },
    // 5. Sustainable Food Group
    {
      group: {
        name: "Green Plate Gang",
        description:
          "Exploring sustainable eating habits. Join us for meatless meals and focus on reducing food waste.",
      },
      actions: [
        {
          category: "Food & Diet", // Added Category
          name: "Meatless Monday Meal",
          description:
            "Prepare and eat a completely plant-based (vegan or vegetarian) main meal on Monday.",
          ecoPoints: 30,
          shortDescription: "Eat a plant-based main meal on Monday.",
        },
        {
          category: "Waste Reduction", // Added Category (overlaps with food)
          name: "Reduce Food Waste Footprint",
          description:
            "Actively plan meals, store food properly, and use leftovers to minimize food waste for 3 consecutive days.",
          ecoPoints: 50,
          shortDescription: "Minimize food waste for 3 days straight.",
        },
      ],
    },
    // --- Vancouver Specific Groups ---
    // 6. Vancouver Transit Users
    {
      group: {
        name: "Vancouver Transit Trekkers",
        description:
          "Promoting the use of Vancouver's public transit system (TransLink). Participate in using transit and share multi-modal journey experiences.",
      },
      actions: [
        {
          category: "Transportation", // Added Category
          name: "Transit Tuesday",
          description:
            "Use TransLink buses, SkyTrain, SeaBus, or West Coast Express for a trip you would normally take by car.",
          ecoPoints: 40,
          shortDescription: "Use TransLink instead of a car for a trip.",
        },
        {
          category: "Transportation", // Added Category
          name: "Multi-Modal Journey",
          description:
            "Combine walking or biking with a public transit trip for a single journey (e.g., bike to SkyTrain).",
          ecoPoints: 55,
          shortDescription: "Combine walk/bike + public transit for a journey.",
        },
      ],
    },
    // 7. Vancouver Park Cleanup
    {
      group: {
        name: "Stanley Park Stewards (Vancouver)",
        description:
          "Dedicated to keeping Vancouver's iconic Stanley Park clean. Join organized cleanups or undertake solo park cleanup actions.",
      },
      actions: [
        {
          category: "Community & Nature", // Added Category
          name: "Solo Park Cleanup",
          description:
            "Spend at least 30 minutes picking up litter in Stanley Park (or another local Vancouver park). Dispose of waste properly.",
          ecoPoints: 70,
          shortDescription: "Spend 30+ mins picking up litter in a park.",
        },
        {
          category: "Community & Nature", // Added Category
          name: "Invasive Plant Pull",
          description:
            "Participate in an organized invasive species removal event in a Vancouver park or designated area.",
          ecoPoints: 80,
          shortDescription: "Join an invasive species removal event.",
        },
      ],
    },
    // 8. Vancouver Water Savers
    {
      group: {
        name: "False Creek Water Watchers (Vancouver)",
        description:
          "Focused on water conservation specific to Vancouver's climate and resources. Practice rainwater capture and adhere to Metro Van watering restrictions.",
      },
      actions: [
        {
          category: "Water Conservation", // Added Category
          name: "Rainwater Capture",
          description:
            "Set up a rain barrel or simple container to collect rainwater for watering plants (ensure compliance with local bylaws).",
          ecoPoints: 40,
          shortDescription: "Collect rainwater for watering plants.",
        },
        {
          category: "Water Conservation", // Added Category
          name: "Metro Van Watering Smarts",
          description:
            "Check and strictly follow the current Metro Vancouver lawn watering restrictions for one week.",
          ecoPoints: 25,
          shortDescription: "Follow Metro Van watering restrictions for a week.",
        },
      ],
    },
    // --- More General Groups ---
    // 9. Local Food Supporters
    {
      group: {
        name: "Localvore League",
        description:
          "Championing local food systems. Seek out farmers market finds and prioritize shopping at local grocers.",
      },
      actions: [
        {
          category: "Food & Diet", // Added Category
          name: "Farmers Market Finds",
          description:
            "Visit a local farmers market and purchase at least two types of produce grown locally.",
          ecoPoints: 35,
          shortDescription: "Buy 2+ local items at a farmers market.",
        },
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Shop Local Grocer",
          description:
            "Make a conscious effort to buy groceries from a locally owned store instead of a large chain for one shopping trip.",
          ecoPoints: 25,
          shortDescription: "Shop at a locally owned grocery store once.",
        },
      ],
    },
    // 10. Repair & Reuse Group
    {
      group: {
        name: "Repair Revolutionaries",
        description:
          "Fighting throwaway culture by repairing items. Try fixing something yourself or attend a repair cafe event.",
      },
      actions: [
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Fix It Forward",
          description:
            "Successfully repair a broken household item, clothing, or electronic device instead of replacing it.",
          ecoPoints: 65,
          shortDescription: "Repair a broken item instead of replacing it.",
        },
        {
          category: "Community & Nature", // Added Category (Community event)
          name: "Repair Cafe Event",
          description:
            "Attend or volunteer at a local Repair Cafe event to learn repair skills or get help fixing an item.",
          ecoPoints: 30,
          shortDescription: "Attend or volunteer at a Repair Cafe.",
        },
      ],
    },
    // 11. Green Cleaning Group
    {
      group: {
        name: "Eco-Clean Crew",
        description:
          "Switching to environmentally friendly cleaning practices. Mix up a DIY green cleaner or choose eco-label cleaning products.",
      },
      actions: [
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "DIY Green Cleaner",
          description:
            "Make and use a homemade, non-toxic cleaner (e.g., vinegar and water solution) for a cleaning task.",
          ecoPoints: 20,
          shortDescription: "Make and use a DIY non-toxic cleaner.",
        },
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Eco-Label Clean Products",
          description:
            "Purchase a cleaning product with a recognized eco-label (e.g., EcoLogo, Green Seal) when you need to restock.",
          ecoPoints: 15,
          shortDescription: "Buy a cleaning product with an eco-label.",
        },
      ],
    },
    // 12. Tree Planting Group
    {
      group: {
        name: "Arboreal Allies",
        description:
          "Focused on increasing green spaces and tree cover. Participate in community tree planting or nurture a seedling.",
      },
      actions: [
        {
          category: "Community & Nature", // Added Category
          name: "Community Tree Plant",
          description: "Participate in an organized tree planting event in your community.",
          ecoPoints: 90,
          shortDescription: "Join an organized tree planting event.",
        },
        {
          category: "Community & Nature", // Added Category
          name: "Seedling Starter",
          description:
            "Plant and care for a tree seedling in a pot or your yard (ensure it's a suitable species for your area).",
          ecoPoints: 50,
          shortDescription: "Plant and care for a tree seedling.",
        },
      ],
    },
    // 13. Plastic Reduction Group
    {
      group: {
        name: "Plastic-Free Pioneers",
        description:
          "Aiming to drastically reduce single-use plastic consumption. Focus on the reusable bag habit and take the no straw pledge.",
      },
      actions: [
        {
          category: "Waste Reduction", // Added Category
          name: "Reusable Bag Habit",
          description:
            "Remember and use reusable shopping bags for all your grocery shopping trips for one week.",
          ecoPoints: 25,
          shortDescription: "Use reusable bags for all groceries this week.",
        },
        {
          category: "Waste Reduction", // Added Category
          name: "No Straw Pledge",
          description:
            "Refuse single-use plastic straws when ordering drinks away from home for an entire week.",
          ecoPoints: 15,
          shortDescription: "Refuse plastic straws for a week.",
        },
      ],
    },
    // 14. Sustainable Fashion Group
    {
      group: {
        name: "Conscious Closet Collective",
        description:
          "Promoting mindful consumption in fashion. Explore secondhand style options or focus on clothing care and longevity.",
      },
      actions: [
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Secondhand Style Seeking",
          description:
            "Purchase an item of clothing from a thrift store, consignment shop, or online secondhand marketplace instead of buying new.",
          ecoPoints: 40,
          shortDescription: "Buy an item of clothing secondhand.",
        },
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Clothing Care & Longevity",
          description:
            "Wash clothes in cold water, line dry when possible, or mend a small tear/sew on a button to extend clothing life.",
          ecoPoints: 20,
          shortDescription: "Care for clothes to extend their life (cold wash/mend).",
        },
      ],
    },
    // 15. Home Gardening Group
    {
      group: {
        name: "Homegrown Heroes",
        description:
          "Cultivating edible plants at home, no matter the space. Start with a windowsill herb garden or plan a patio veggie patch.",
      },
      actions: [
        {
          category: "Food & Diet", // Added Category
          name: "Windowsill Herb Garden",
          description:
            "Plant and maintain at least two types of culinary herbs on a windowsill or balcony.",
          ecoPoints: 30,
          shortDescription: "Plant and maintain 2+ herbs indoors.",
        },
        {
          category: "Food & Diet", // Added Category
          name: "Patio Veggie Patch",
          description:
            "Grow at least one type of vegetable (like lettuce, radishes, or tomatoes) in a container on your patio or balcony.",
          ecoPoints: 55,
          shortDescription: "Grow at least one vegetable in a container.",
        },
      ],
    },
    // 16. Vancouver Shop Local
    {
      group: {
        name: "Mount Pleasant Merchants Fans (Vancouver)",
        description:
          "Supporting the unique local businesses in Vancouver's Mount Pleasant neighbourhood. Complete the 'Shop Main Street' challenge or grab a local coffee.",
      },
      actions: [
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Shop Main Street",
          description:
            "Make a purchase (any value) from an independent, locally-owned shop on Main Street (between approx Broadway and 33rd).",
          ecoPoints: 30,
          shortDescription: "Buy something from a local Main St shop.",
        },
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Local Coffee Fix",
          description:
            "Buy a coffee or tea from an independent coffee shop in Mount Pleasant instead of a large chain.",
          ecoPoints: 10,
          shortDescription: "Get coffee from a local Mount Pleasant cafe.",
        },
      ],
    },
    // 17. Digital Detox Group
    {
      group: {
        name: "Digital Declutter Crew",
        description:
          "Reducing digital consumption and e-waste. Try reducing screen time or decluttering your inbox.",
      },
      actions: [
        {
          category: "Consumption & Lifestyle", // Added Category
          name: "Screen Time Reduction",
          description:
            "Reduce your non-essential screen time (phone, computer, TV) by at least 1 hour compared to your average for one day.",
          ecoPoints: 25,
          shortDescription: "Reduce non-essential screen time by 1+ hour.",
        },
        {
          category: "Waste Reduction", // Added Category (digital waste/clutter)
          name: "Inbox Zero Hero",
          description: "Unsubscribe from at least 5 marketing email lists you no longer read.",
          ecoPoints: 15,
          shortDescription: "Unsubscribe from 5+ unwanted email lists.",
        },
      ],
    },
    // 18. Community Science Group
    {
      group: {
        name: "Citizen Science Squad",
        description:
          "Contributing to environmental research through observation. Participate in a BioBlitz or contribute to a bird count.",
      },
      actions: [
        {
          category: "Community & Nature", // Added Category
          name: "BioBlitz Event",
          description:
            "Participate in a local BioBlitz event, identifying and recording as many species as possible in a set area and time.",
          ecoPoints: 60,
          shortDescription: "Participate in a local BioBlitz species count.",
        },
        {
          category: "Community & Nature", // Added Category
          name: "Bird Count Contribution",
          description:
            "Spend at least 15 minutes observing birds in your area and submit your sightings to a citizen science project (like eBird or iNaturalist).",
          ecoPoints: 35,
          shortDescription: "Observe and report bird sightings for 15+ mins.",
        },
      ],
    },
    // 19. Green Transportation Alternatives
    {
      group: {
        name: "Beyond the Bike Lane",
        description:
          "Exploring diverse green transportation options. Try carpool coordination or take an e-scooter expedition.",
      },
      actions: [
        {
          category: "Transportation", // Added Category
          name: "Carpool Coordination",
          description:
            "Arrange and complete a carpool trip (sharing a ride with at least one other person) for a journey you both would have otherwise made separately.",
          ecoPoints: 45,
          shortDescription: "Arrange and complete a carpool trip.",
        },
        {
          category: "Transportation", // Added Category
          name: "E-Scooter Expedition",
          description:
            "Use a shared e-scooter or e-bike service for a short trip (under 5km) instead of driving.",
          ecoPoints: 20,
          shortDescription: "Use a shared e-scooter/e-bike for a short trip.",
        },
      ],
    },
    // 20. Advocacy & Awareness Group
    {
      group: {
        name: "Eco Advocate Alliance",
        description:
          "Focusing on raising awareness and promoting environmental policy. Share an informative eco post or contact your representative.",
      },
      actions: [
        {
          category: "Community & Nature", // Added Category
          name: "Informative Eco Post",
          description:
            "Share a credible article, video, or resource about an environmental issue on your social media or with friends/family.",
          ecoPoints: 15,
          shortDescription: "Share a credible environmental resource.",
        },
        {
          category: "Community & Nature", // Added Category
          name: "Contact Your Rep",
          description:
            "Write an email or make a call to a local or national government representative about an environmental concern or policy.",
          ecoPoints: 75,
          shortDescription: "Contact a government rep about an environmental issue.",
        },
      ],
    },
  ];
  // --- End Data Definitions ---

  const allGroupPromises = []; // To track only the final group creation promises

  try {
    // Iterate through each group definition
    for (const groupDef of groupsData) {
      // --- Create EcoAction Documents Concurrently & Get Their IDs ---
      // Use map to create an array of promises, each resolving with the new action's ID
      const actionIdPromises = groupDef.actions.map(async (action) => {
        const actionData = {
          // Data for the ecoactions collection
          category: action.category, // **** Include category ****
          name: action.name,
          description: action.description,
          ecoPoints: action.ecoPoints,
          shortDescription: action.shortDescription,
        };
        // Use .add() to get auto-ID, await the reference
        const docRef = await db.collection("ecoactions").add(actionData);
        return docRef.id; // Return the generated ID
      });

      // Wait for all action creation promises to resolve and get the array of generated IDs
      const generatedActionIds = await Promise.all(actionIdPromises);
      console.log(
        `Actions for group "${groupDef.group.name}" created with IDs: ${generatedActionIds.join(
          ", "
        )}`
      );

      // --- Create EcoGroup Document with the generated Action IDs ---
      const groupData = {
        name: groupDef.group.name,
        description: groupDef.group.description,
        ecoactions: generatedActionIds, // Use the NEWLY generated action IDs
        users: [], // Empty user array as requested
        createdOn: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp
      };

      // Use .add() for the group, let Firestore generate the group ID
      const groupPromise = db.collection("ecogroups").add(groupData);
      allGroupPromises.push(groupPromise); // Add the group creation promise to the tracking array
    }

    // Wait for ALL group creation operations to complete
    await Promise.all(allGroupPromises);

    console.log("------------------------------------------");
    console.log(
      `Database seeding complete! ${groupsData.length} groups and their actions created with categories.`
    );
    console.log("------------------------------------------");
  } catch (error) {
    console.error("------------------------------------------");
    console.error("Error during database seeding:", error);
    console.error("------------------------------------------");
  }
}
