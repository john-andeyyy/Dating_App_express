const User = require('../Model/UserSchema')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_Refresh = process.env.JWT_Refresh;


exports.Signup = async (req, res) => {
    console.log("Signup");

    try {
        const { Username, Password, Phonenumber, Birthday, bio, Name } = req.body;
        // console.log(req.body);
        const imgFile = req.file;

        let existingEmail
        if (Username) {
            existingEmail = await User.findOne({ Email: Username });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists!" });
            }
        } else {
            existingEmail = await User.findOne({ Phonenumber: Phonenumber });
            if (existingEmail) {
                return res.status(400).json({ message: "Phone Number already exists!" });
            }
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
    console.log('Login');
    const { Username, Password } = req.body;
    try {
        let UserData = await User.findOne({
            $or: [
                { Email: Username },
                { Phonenumber: Username }
            ]
        });

        if (!UserData)
            return res.status(400).json({ message: "User Not found!" });

        const Ismatched = await bcrypt.compare(Password, UserData.Password);
        if (!Ismatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const AccessToken = jwt.sign({ id: UserData._id }, JWT_SECRET, { expiresIn: "15m" });
        const Refresh_Token = jwt.sign({ id: UserData._id }, JWT_Refresh, { expiresIn: '30d' });


        res.status(200).json({
            message: "Login Successful",
            Data: {
                _id: UserData._id,
                Username: UserData.Username,
                AccessToken,
                Refresh_Token
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }
}

exports.RefreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ error: "Refresh token invalid" });
    }

    jwt.verify(refreshToken, JWT_Refresh, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid refresh token" });

        const newAccessToken = jwt.sign(
            { username: user.username },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken: newAccessToken });
    });
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