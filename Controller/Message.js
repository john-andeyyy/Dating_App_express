const User = require('../Model/UserSchema');
const Message = require('../Model/MessageSchema');

exports.Send = async (req, res) => {
    try {
        const { Userid, MatchingId, message } = req.body;

        if (!Userid || !MatchingId || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const receiverExists = await User.findById(MatchingId);
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        const newMessage = await Message.create({
            userId: Userid,
            matchUserId: MatchingId,
            message
        });

        return res.status(200).json({
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
};

exports.GetConvoMessage = async (req, res) => {
    try {
        // const { userId, matchUserId } = req.params;
        const { userId, matchUserId } = req.params;

        if (!userId || !matchUserId) {
            return res.status(400).json({ message: "userId and matchUserId are required" });
        }

        const messages = await Message.find({
            $or: [
                { userId, matchUserId },
                { userId: matchUserId, matchUserId: userId }
            ]
        })
            .sort({ createdAt: 1 }) // sort by oldest first
            .populate('userId', 'Email')
            .populate('matchUserId', 'Email');

        if (messages.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            sender: msg.userId.Email,
            receiver: msg.matchUserId.Email,
            message: msg.message,
            date: msg.createdAt.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: msg.createdAt.toLocaleTimeString('en-PH', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        }));

        return res.status(200).json({
            message: "Messages retrieved successfully",
            data: formattedMessages
        });

    } catch (error) {
        console.error(`Error retrieving messages: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
};
