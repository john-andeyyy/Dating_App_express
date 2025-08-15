const IsMatched = require('../Model/IsMatchSchema');
const User = require('../Model/UserSchema')

exports.Swipe_Left_or_Right = async (req, res) => {

    const { Userid, MatchingId, IsMatch } = req.body;

    try {

        const user = await User.findById(Userid)
        const userlike = await User.findById(MatchingId)

        if (!user || !userlike) {
            return res.status(404).json({ message: "User not found" });
        }

        const isokay = await IsMatched.create({
            userId: Userid,
            userSuggestion: MatchingId,
            isMatch: IsMatch
        });

        if (isokay)
            return res.status(200).json({ Message: "Successfull liked" })

        return res.status(400).json({ message: "There are an internal problem." })
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }

}

exports.Like_unlike = async (req, res) => {
    console.log("Like_unlike");
    
    const { Userid, MatchingId, isLike } = req.body;
    // console.log(req.body);
    

    try {
        let record = await IsMatched.findOne({ userId: Userid, userSuggestion: MatchingId });

        if (!record) {
            record = new IsMatched({
                userId: Userid,
                userSuggestion: MatchingId,
                isLike,
                isMatch: false
            });
        } else {
            record.isLike = isLike;
        }

        await record.save();

        if (isLike) {
            const reverseRecord = await IsMatched.findOne({
                userId: MatchingId,
                userSuggestion: Userid,
                isLike: true
            });

            if (reverseRecord) {
                record.isMatch = true;
                reverseRecord.isMatch = true;
                await record.save();
                await reverseRecord.save();
            }
        }

        let action = isLike ? 'like' : 'skip';
        return res.status(200).json({
            message: `Successfully ${action}d`,
            match: record.isMatch || false
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).json({ message: error.message });
    }
};

exports.unMatch = async (req, res) => {
    const { Userid, MatchingId } = req.body;
    try {
        const unlike = IsMatched.find({ userId: Userid, userSuggestion: MatchingId })
        if (!unlike)
            return res.status(404).json({ message: "User not found" });

        // console.log(unlike);

        const isokay = await IsMatched.deleteOne({
            userId: Userid,
            userSuggestion: MatchingId
        });
        await IsMatched.deleteOne({
            userId: MatchingId,
            userSuggestion: Userid
        });

        if (isokay)
            return res.status(200).json({ Message: "Successfull unlike" })

        return res.status(400).json({ message: "There are an internal problem." })
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.error(`Error: ${error.message}`);
    }

}

exports.MatchedList = async (req, res) => {
    const { Userid } = req.params;

    try {
        const list = await IsMatched.find({
            userId: Userid,
            isMatch: true
        })
            .populate('userSuggestion','-password');

        if (!list || list.length === 0) {
            return res.status(404).json({ message: "No matches found" });
        }

        return res.status(200).json({
            message: "Successful retrieve",
            data: list
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
}; 

const mongoose = require('mongoose');

exports.list = async (req, res) => {
    console.log("list");
    
    const { userId } = req.params;

    try {
        const interactedUsers = await IsMatched.find({ userId }).distinct('userSuggestion');
        const excludeIds = [userId, ...interactedUsers].map(id => new mongoose.Types.ObjectId(id));

        const users = await User.aggregate([
            { $match: { _id: { $nin: excludeIds }, Phonenumber: { $exists: true, $ne: "" } } },
            { $project: { Password: 0 } },
            // { $sample: { size: 10 } }
        ]);

        if (!users.length) {
            return res.status(404).json({ message: "No available matches" });
        }

        res.status(200).json({ message: "Successfully retrieved random matches", data: users });
    } catch (error) {
        console.error(`Error fetching matches: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};
