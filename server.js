const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// static folder
app.use(express.static(path.join(__dirname, "public")));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

const botName = "小艾機器人";
// Run when client connects
io.on("connection", socket => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // sned a message to a single user
        socket.emit("message", formatMessage(botName, `歡迎進入${user.room}聊天室`));
        // Broadcast to everyone when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username}加入了聊天室`));
        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        // Runs when client disconnects
        socket.on("disconnect", () => {
            const user = userLeave(socket.id);
            if(user){
                io.to(user.room).emit("message", formatMessage(botName, `${user.username}離開了聊天室`));
                // Send users and room info
                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
});

// render index.ejs
app.get("/", (req, res) => {
    res.render("index");
})

app.get("/chat", (req, res) => {
    res.render("chat");
})

const PORT = 8080 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

