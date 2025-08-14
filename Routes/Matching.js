const express = require('express');
const Router = express.Router();
const Matching = require('../Controller/Matching')
const AuthChecker = require('../Middleware/IsAuthorize')


Router.get("/MatchedList/:Userid", AuthChecker.isexisting, Matching.MatchedList);
Router.post("/Swipe_Left_or_Right", AuthChecker.isexisting, Matching.Swipe_Left_or_Right);
Router.post("/Like_unlike", AuthChecker.isexisting, Matching.Like_unlike);
Router.put("/unMatch", AuthChecker.isexisting, Matching.unMatch);
Router.get("/PeopleList/:userId", AuthChecker.isexisting, Matching.list);

module.exports = Router; 