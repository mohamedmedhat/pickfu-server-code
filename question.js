const axios = require("axios");
const uuidv4 = require("uuid").v4;
const https = require("https");
const url = "http://localhost:3001/values";

const answers = new Set();
let allanswers = new Set();
const users = new Map();

const defaultUser = {
  id: "anon",
  name: "Anonymous",
};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("getAnswers", () => this.getAnswers());
    socket.on("answer", (value) => this.handleAnswer(value));
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.answer}`);
    });
  }

  sendAnswer(answer) {
    //console.log(answer);
    // axios({
    //     method: 'post',
    //     url: url,
    //     data: {
    //       id: answer.id,
    //       value: answer.value,

    //     }
    //   });
    //axios.post("http://localhost:3001", answer);
    this.io.sockets.emit("answer", answer);
  }

  getAnswers() {
    let allAnswers = [];
    axios.get(url).then((res) => {
      allAnswers = res.data;
      //console.log(allAnswers);
      allAnswers.forEach((answer) => this.sendAnswer(answer));
    });
  }

  handleAnswer(value) {
    console.log(value);
    const answer = {
      id: uuidv4(),
      user: users.get(this.socket) || defaultUser,
      value,
      time: Date.now(),
    };
    axios({
        method: 'post',
        url: url,
        data: {
          id: answer.id,
          value: answer.value,
          user:users.get(this.socket) || defaultUser,
          time: Date.now(),
        }
      });
    answers.add(answer);
    this.sendAnswer(answer);
  }

  disconnect() {
    users.delete(this.socket);
  }
}

function question(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = question;
