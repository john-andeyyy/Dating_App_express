const User = require('../Model/UserSchema')

exports.isexisting = async (req, res, next) => {
    try {
        // const { Email, Phonenumber, Id, UserId_Auth } = req.body; 

        // const existingUser = await User.findOne({
        //     $or: [
        //         { Email },
        //         { Phonenumber },
        //         { _id: Id },
        //         { _id: UserId_Auth }
        //     ]
        // });

        // if (existingUser) {
        //     return res.status(400).json({ message: "User already exists" });
        // }

        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
};
