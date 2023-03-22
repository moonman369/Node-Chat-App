const bodyParser = require("body-parser");
const express = require("express");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = process.env.DB_URL;

const Message = mongoose.model("Message", {
  name: String,
  message: String,
});
const messages = [{ name: "John Doe", message: "Genesis Message" }];

app.get("/messages", async (req, res) => {
  const messages = await Message.find({});
  // console.log(messages);
  res.send(messages);
});

app.post("/messages", async (req, res) => {
  try {
    if (req.body.name && req.body.message) {
      // console.log(req.body);
      const message = new Message(req.body);

      const savedMsg = await message.save();

      console.log("Saved.");

      const censoredMessages = await Message.find({ message: "badword" });

      if (censoredMessages.length > 0) {
        console.log("Censored words found", censoredMessages);
        for (let censored of censoredMessages) {
          const remove = await Message.findOneAndRemove({ _id: censored._id });
          console.log(remove);
        }

        res.sendStatus(200);
        return;
      } else {
        io.emit("message", req.body);
      }

      // messages.push(req.body);

      res.sendStatus(200);

      // catch((err) => {
      //   console.error(err);
      //   res.send(500);
      // });
    }
  } catch (error) {
    console.error(error);
  }
});

io.on("connection", (socket) => {
  console.log("a user just connected");
});

mongoose.connect(dbUrl);

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
