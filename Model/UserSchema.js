const mongoose = require('mongoose')

const User = new mongoose.Schema({

    Email: { type: String, default: ''},
    Password: { type: String, default: '', required: true },
    Phonenumber: { type: String, default: ''},
    Name: { type: String, default: ''},
    Birthday: { type: String, default: '', required: true },
    bio: { type: String, default: '' },
    Image: { type: Buffer, default: null },

})
module.exports = mongoose.models.Services || mongoose.model('User', User);
