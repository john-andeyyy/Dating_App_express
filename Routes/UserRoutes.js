const express = require('express');
const Router = express.Router();
const UserAuth = require('../Controller/UserAuth')
const multer = require('multer');
const upload = multer();
const AuthChecker = require('../Middleware/IsAuthorize')


Router.post("/auth/login", UserAuth.Login);
Router.post('/auth/signup', upload.single('Image'), UserAuth.Signup);

// With user checker/ with basic auth
Router.put('/auth/update', AuthChecker.isexisting, upload.single('Image'), UserAuth.update);
Router.get('/auth/retrive/:Userid', AuthChecker.isexisting, UserAuth.RetrieveProfile);
Router.put('/auth/ChangePass', AuthChecker.isexisting, upload.single('Image'), UserAuth.ChangePass);

module.exports = Router; 