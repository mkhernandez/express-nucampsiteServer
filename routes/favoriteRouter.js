const express =  require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find()
    .populate('user', 'campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        //if there is a favorite check if campsite is in the favorite array
        //if in array move on otherwise add the campsite to the end of the array
        if(favorite) { //favorite array exists
            let arr = favorite.campsites; //set variable to the favorite campsites array
            let index = arr.indexOf(req.body[0]._id);//look for campsite in the array 
            if(index > -1) { // campsite found in the array
                const err = new Error('The campsite already exists in the favorite array!');
                err.status = 404;
                return next(err);
            }else { //campsite not in the favorite array
                favorite.campsites.push(req.body[0]._id);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        }else{ //create a favorite document if no favorites are in array and insert the campsite into the array
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorits');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) { //check if favorite exists if so delete it
            favorite.remove()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }else { //favorite does not exist cannot delete it
            const err = new Error('Favorite does not exist!');
            err.status = 403;
            return next(err);
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite){ //check if favorite array exists if so
            if(favorite.campsites.indexOf(req.params.campsiteId) === -1) { //not in the array
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }else { //campsite is in the array
                const err = new Error('That campsite is already in the array of favorites!');
                err.status = 404;
                return next(err);
            }
        }else{
            //create new favorite document if it doesn't exist at all and add the campsite 
            Favorite.create({user: req.user._id, campsites: req.params.campsiteId})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId); //if campsite exists set index to variable for deletion
            if(index > -1) { //campsite exists 
                favorite.campsites.splice(index, 1);
            }
            favorite.save()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
        }else { //favorite array does not exist
            const err = new Error('The favorite array does not exist. Cannot delete!');
            err.status = 403;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;