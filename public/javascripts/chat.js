document.querySelector("#input-message").focus();
const chatForm = document.getElementById("chat-form");
const chatBox = document.querySelector(".chat-box");
const socket = io();

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// Join chatroom
socket.emit("joinRoom", {
    username,
    room
});

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// Message from server
socket.on("message", message => {
    // console.log(message);
    outputMessage(message);
    // Scroll down
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Get message text
    const msg = document.getElementById("input-message").value;
    // Emit message to server
    socket.emit("chatMessage", msg);
    // clear input
    document.getElementById("input-message").value = "";
    document.getElementById("input-message").focus();
});

// output message to DOM
function outputMessage(message){
    // console.log(message);
    const div = document.createElement("div");
    div.classList.add("message", "border", "bg-white", "text-black", "mb-1", "p-1");
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
    `;
    document.querySelector(".chat-box").appendChild(div);
}

// output Room to DOM
function outputRoomName(room){
    document.querySelector("#room-name").textContent = room;
}

// output Users to DOM
function outputUsers(users){
    document.querySelector("#users").textContent = users.length;
}