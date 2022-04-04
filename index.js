const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const user_list = new Array();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });

io.on("connection", (socket) => {
  // 최초 접속시 유저 리스트 띄우기
  if (user_list) io.emit("user_list", user_list);

  socket.on("welcome-msg", (nickname) => {
    console.log(`${nickname} connected`);
    // user_list 에 추가
    var new_user = {
      id: socket.id,
      nickname: nickname,
    };
    // user_list[socket.id.replace(/[^0-9]/g, '')] = new_user;
    user_list.push(new_user);
    console.log(user_list);
    io.emit("update_user_list", new_user);
    socket.broadcast.emit("welcome-msg", nickname);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);

    var user_id;
    var user_nick;
    user_list.forEach((el, index) => {
      if (el.id == socket.id) {
        user_id = el.id;
        user_nick = el.nickname;
        user_list.splice(index, 1);
        console.log("old_user");
        console.log(user_id, user_nick);
        return false;
      }
    });
    if (user_id) {
      io.emit("del_user_list", user_id, user_nick);
    }
  });
  socket.on("bye-msg", (nick) => {
    socket.broadcast.emit("bye-msg", nick);
  });

  socket.on("chat message", (nick, msg) => {
    console.log(nick + " : " + msg);
    io.emit("chat message", nick, msg);
  });
  socket.on("writing-msg", (nick) => {
    socket.broadcast.emit("writing-msg", nick);
  });
  socket.on("writing-msg-del", (nick) => {
    socket.broadcast.emit("writing-msg-del", nick);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
