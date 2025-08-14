const express = require('express');
const Router = express.Router();
const Msg = require('../Controller/Message')
const AuthChecker = require('../Middleware/IsAuthorize')


Router.post("/Send", AuthChecker.isexisting, Msg.Send);
Router.get("/MessageList/:userId/:matchUserId", AuthChecker.isexisting, Msg.GetConvoMessage);

module.exports = Router; 