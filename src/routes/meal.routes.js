const express = require('express');
const router = express.Router();

const mealController = require('../controllers/meal.controller');

//########## Meals ###############

//Add a meal
router.post("/meal", mealController.addMeal);

//Get all meals
router.get("/meal", mealController.getAllMeals);

//Get meal by id
router.get("/meal/:id", mealController.validateId, mealController.getMealById);

//Update meal
router.put("/meal/:id", mealController.validateId, mealController.updateMeal);

//Delete meal
router.delete("/meal/:id", mealController.validateId, mealController.deleteMeal);

module.exports = router;