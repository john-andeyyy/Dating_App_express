let io;

exports.init = (socketIo) => {
    io = socketIo;
};

exports.SocketNotification = (receiverId, message, senderId) => {
    if (!io) return console.error("❌ Socket.io not initialized");

    io.to(receiverId.toString()).emit("New_Notif", {
        message,
        senderId,
        receiverId
    });
};
