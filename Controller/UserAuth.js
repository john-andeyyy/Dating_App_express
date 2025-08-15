const User = require('../Model/UserSchema')
const bcrypt = require("bcryptjs");



exports.update = async (req, res) => {
    console.log('update');
    
    try {
        const { Id, Name, Email, Phonenumber, Birthday, bio } = req.body;
        console.log(req.body);
        
        const imgFile = req.file;

       
        let UserData = await User.findById(Id);


        if (!UserData) return res.status(400).json({ message: "User not found" });

        UserData.Email = Email;
        UserData.Phonenumber = Phonenumber;
        UserData.Birthday = Birthday;
        UserData.bio = bio;
        UserData.Name = Name;
        if (imgFile) UserData.Image = imgFile.buffer;

        UserData.save();
        return res.status(200).json({ message: "Successfully updated" });


    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
}
exports.Signup = async (req, res) => {
    try {
        const { Username, Password, Phonenumber, Birthday, bio, Name } = req.body;
        const imgFile = req.file;
        
        const existingEmail = await User.findOne({ Email: Username });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // Check if phone number already exists (if provided)
        if (Phonenumber) {
            const existingPhone = await User.findOne({ Phonenumber });
            if (existingPhone) {
                return res.status(400).json({ message: "Phone number already exists!" });
            }
        }

        const hashedPassword = await bcrypt.hash(Password, 12);

        let newUser = new User({
            Email: Username,
            Password: hashedPassword,
            Phonenumber: Phonenumber || "",
            Birthday,
            bio: bio || "",
            Name
        });

        if (imgFile) {
            newUser.Image = imgFile.buffer;
        }

        await newUser.save();
        res.status(200).json({ message: "Created Successfully." });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};


exports.Login = async (req, res) => {
    console.log('admin Login');
    const { Username, Password } = req.body;


    try {
        let UserData = await User.findOne({
            $or: [{ Email: Username }]
        });

        if (!UserData)
            return res.status(400).json({ message: "user Not found!" });

        const Ismatched = await bcrypt.compare(Password, UserData.Password);
        if (!Ismatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login Successful",
            Data: {
                _id: UserData._id,
                Username: UserData.Username
            }
        });





    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
}

exports.RetrieveProfile = async (req, res) => {
    const { Userid } = req.params;
    

    try {
        let UserData = await User.findById(Userid)
        

        res.status(200).json({
            message: "retrive Successful",
            Data: UserData
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
}

exports.ChangePass = async (req, res) => {
    const { Id, NewPass, Password } = req.body;
    let UserData = await User.findById(Id);
    if (!UserData) return res.status(400).json({ message: "User not found" });

    try {
        const Ismatched = await bcrypt.compare(Password, UserData.Password);
        if (!Ismatched) {
            return res.status(400).json({ message: "New and old Password Not Match" });
        }
        Ismatched.Password = await bcrypt.hash(NewPass, 12);
        Ismatched.save;

        res.status(200).json({
            message: "Change Passoword Successful",
            // Data: UserData
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
}