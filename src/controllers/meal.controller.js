require('dotenv').config();
const assert = require('assert');
const { off } = require('process');

const dbconnection = require('../database/dbconnection');
const logger = require('../config/tracer_config').logger;

let controller = {
    validateMeal: (req, res, next) => {
    
    },
    validateId: (req, res, next) => {
        const userId = req.params.id;
        try {
            assert(Number.isInteger(parseInt(userId)), "Id must be a number");
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
            }

            logger.debug(error);
            next(error);
        }
    },
    addMeal: (req, res) => {
        logger.debug('Meal added');
        
    },
    getAllMeals: (req, res) => {
    logger.debug('Get all meals');
    
    },
    getMealById: (req, res) => {
    logger.debug('Get meal by id');
    
    },
    updateMeal: (req, res) => {
    logger.debug('Update meal by id');
    
    },
    deleteMeal: (req, res) => {
    logger.debug('Delete meal by id');
    
    }
}

module.exports = controller;