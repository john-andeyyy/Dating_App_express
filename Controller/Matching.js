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
    const { Userid, MatchingId, isLike } = req.body;

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

        console.log(unlike);

        const isokay = await IsMatched.deleteOne({
            userId: Userid,
            userSuggestion: MatchingId
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

exports.list = async (req, res) => {
    const { userId } = req.params;

    try {
        const interactedUsers = await IsMatched
            .find({ userId }) 
            .distinct('userSuggestion');

        const excludeIds = [userId, ...interactedUsers];

        // Get all users that are not excluded
        const availableUsers = await User
            .find({
                _id: { $nin: excludeIds }
            })
            .select('-Password');

        if (availableUsers.length === 0) {
            return res.status(404).json({ message: "No available matches" });
        }

        res.status(200).json({
            message: "Successfully retrieved matches",
            data: availableUsers
        });

    } catch (error) {
        console.error(`Error fetching matches: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};
