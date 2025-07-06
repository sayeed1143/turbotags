import React, { useState, useEffect } from 'react';

// --- Pre-saved Data for Offline Tag/Hashtag Generation ---
// This data now includes a 'niche' property for better categorization
const preSavedData = [
  {
    niche: 'React Development',
    keywords: ['react tutorial', 'react js', 'frontend development', 'web dev', 'javascript framework', 'react hooks', 'react components', 'coding', 'programming', 'ui development', 'web programming', 'react projects'],
    tags: [
      'ReactJS Tutorial', 'React for Beginners', 'Web Development', 'Frontend Development', 'JavaScript Framework',
      'Learn React', 'React Hooks', 'React State Management', 'React Components', 'Coding Tutorial',
      'Programming', 'Web Dev Tutorial', 'Modern JavaScript', 'React Guide', 'Build React App',
      'React Basics', 'UI Development', 'React Development', 'Web Programming', 'React Tips',
      'React Best Practices', 'Front End Coding', 'React Projects', 'Web Design', 'Developer Tutorial',
      'React Router', 'Context API', 'Redux Tutorial', 'NextJS Basics', 'Gatsby Tutorial' // Added more for variety
    ],
    hashtags: [
      '#ReactJS', '#ReactTutorial', '#WebDev', '#Frontend', '#JavaScript',
      '#Coding', '#Programming', '#LearnToCode', '#ReactHooks', '#WebDevelopment',
      '#UIUX', '#ReactDeveloper', '#TechTutorial', '#ReactCommunity', '#Fullstack',
      '#WebDesign', '#ReactTips', '#DevLife', '#CodeLife', '#ReactApps' // Added more for variety
    ]
  },
  {
    niche: 'Cooking & Food',
    keywords: ['cooking', 'recipe', 'food', 'easy meals', 'homemade food', 'quick recipes', 'dinner ideas', 'healthy eating', 'food blog', 'meal prep', 'delicious food', 'home cooking', 'simple recipes', 'kitchen tips', 'foodie', 'baking', 'dessert', 'vegetarian', 'vegan', 'cuisine'],
    tags: [
      'Cooking', 'Recipe', 'Easy Meals', 'Homemade Food', 'Quick Recipes',
      'Dinner Ideas', 'Healthy Eating', 'Food Blog', 'Cooking Tutorial', 'Meal Prep',
      'Delicious Food', 'Home Cooking', 'Simple Recipes', 'Kitchen Tips', 'Foodie',
      'Breakfast Ideas', 'Lunch Ideas', 'Vegetarian Recipes', 'Vegan Recipes', 'Baking',
      'Dessert Recipes', 'Comfort Food', 'International Cuisine', 'Cooking Hacks', 'Food Lovers',
      'Healthy Recipes', 'Family Meals', 'Gourmet Food', 'Food Hacks', 'Chef Life' // Added more for variety
    ],
    hashtags: [
      '#Cooking', '#Recipes', '#Foodie', '#EasyMeals', '#HomeCooking',
      '#MealPrep', '#HealthyFood', '#DinnerIdeas', '#FoodBlog', '#KitchenHacks',
      '#Delicious', '#Homemade', '#Yummy', '#FoodLover', '#CookWithMe',
      '#FoodVlog', '#RecipeIdeas', '#VeganFood', '#Vegetarian', '#BakingLove' // Added more for variety
    ]
  },
  {
    niche: 'Gaming & Streaming',
    keywords: ['gaming', 'gameplay', 'video games', 'stream', 'live stream', 'gaming channel', 'new game', 'gaming highlights', 'walkthrough', 'gaming community', 'pc gaming', 'console gaming', 'esports', 'gaming tips', 'best games', 'gaming review', 'gaming setup', 'funny moments', 'montage', 'game news', 'indie games', 'action games', 'adventure games', 'rpg'],
    tags: [
      'Gaming', 'Gameplay', 'Video Games', 'Live Stream', 'Gaming Channel',
      'New Game', 'Gaming Highlights', 'Walkthrough', 'Gaming Community', 'PC Gaming',
      'Console Gaming', 'Esports', 'Gaming Tips', 'Best Games', 'Gaming Review',
      'Gaming Setup', 'Funny Moments', 'Gaming Montages', 'Game News', 'Gaming Trends',
      'Indie Games', 'Action Games', 'Adventure Games', 'Strategy Games', 'RPG',
      'Fortnite', 'Minecraft', 'Valorant', 'League of Legends', 'Gaming Life' // Added more for variety
    ],
    hashtags: [
      '#Gaming', '#VideoGames', '#Gamer', '#LiveStream', '#Twitch',
      '#YouTubeGaming', '#Esports', '#GamingCommunity', '#PCGaming', '#ConsoleGaming',
      '#GamePlay', '#NewGame', '#GamingLife', '#Streamer', '#GamingVids',
      '#GamingSetup', '#FunnyGaming', '#GameReview', '#IndieGame', '#ProGamer' // Added more for variety
    ]
  },
  {
    niche: 'Travel & Adventure',
    keywords: ['travel', 'vlog', 'adventure', 'explore', 'travel guide', 'budget travel', 'solo travel', 'travel tips', 'vacation ideas', 'destination guide', 'travel inspiration', 'wanderlust', 'backpacking', 'road trip', 'travel photography', 'travel videos', 'cultural travel', 'nature travel', 'city breaks', 'beach vacation', 'mountain trekking', 'travel experiences', 'hidden gems', 'itinerary'],
    tags: [
      'Travel Vlog', 'Adventure Travel', 'Explore The World', 'Travel Guide', 'Budget Travel',
      'Solo Travel', 'Travel Tips', 'Vacation Ideas', 'Destination Guide', 'Travel Inspiration',
      'Wanderlust', 'Backpacking', 'Road Trip', 'Travel Photography', 'Travel Videos',
      'Cultural Travel', 'Nature Travel', 'City Breaks', 'Beach Vacation', 'Mountain Trekking',
      'Travel Experiences', 'Hidden Gems', 'Travel Itinerary', 'Local Food', 'Travel Hacks',
      'World Travel', 'Explore Nature', 'Adventure Time', 'Travel Blogger', 'Travel Goals' // Added more for variety
    ],
    hashtags: [
      '#Travel', '#TravelVlog', '#Adventure', '#Explore', '#Wanderlust',
      '#TravelGram', '#TravelTips', '#Vacation', '#BucketList', '#TravelGoals',
      '#ExploreMore', '#TravelLife', '#Getaway', '#TravelInspiration', '#BeautifulDestinations',
      '#RoadTrip', '#SoloTravel', '#TravelPhotography', '#TravelAddict', '#ExploreTheWorld' // Added more for variety
    ]
  },
  {
    niche: 'Fitness & Health',
    keywords: ['fitness', 'workout', 'health', 'exercise', 'home workout', 'gym motivation', 'weight loss', 'muscle building', 'healthy lifestyle', 'fitness tips', 'nutrition', 'cardio', 'strength training', 'yoga', 'pilates', 'bodybuilding', 'personal trainer', 'diet plan', 'fitness journey', 'workout routine', 'healthy habits', 'wellness', 'mindfulness', 'active lifestyle', 'sport'],
    tags: [
      'Fitness', 'Workout', 'Health', 'Exercise', 'Home Workout',
      'Gym Motivation', 'Weight Loss', 'Muscle Building', 'Healthy Lifestyle', 'Fitness Tips',
      'Nutrition', 'Cardio', 'Strength Training', 'Yoga', 'Pilates',
      'Bodybuilding', 'Personal Trainer', 'Diet Plan', 'Fitness Journey', 'Workout Routine',
      'Healthy Habits', 'Wellness', 'Mindfulness', 'Active Lifestyle', 'Sport',
      'FitLife', 'GymLife', 'HealthyFood', 'WorkoutMotivation', 'DailyWorkout' // Added more for variety
    ],
    hashtags: [
      '#Fitness', '#Workout', '#Health', '#Exercise', '#GymLife',
      '#HealthyLifestyle', '#Motivation', '#WeightLoss', '#StrengthTraining', '#Yoga',
      '#Cardio', '#FitLife', '#GetFit', '#HealthyLiving', '#Bodybuilding',
      '#WorkoutChallenge', '#FitnessJourney', '#NutritionTips', '#MindAndBody', '#ActiveLife' // Added more for variety
    ]
  }
];
// --- End of Pre-saved Data ---
