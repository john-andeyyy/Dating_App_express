const express = require('express');
const Router = express.Router();
const Msg = require('../Controller/Message')
const AuthChecker = require('../Middleware/IsAuthorize')


Router.post("/Send", AuthChecker.isexisting, Msg.Send);
Router.get("/MessageList/:senderId/:receiverId", AuthChecker.isexisting, Msg.GetConvoMessage);
Router.get("/MatchedListMsg/:Userid", AuthChecker.isexisting, Msg.MatchedListMsg);


module.exports = Router; 