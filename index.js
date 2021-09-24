const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");

//use cors
app.use(cors());

//use json encode
app.use(express.json({ extended: false }));

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//routes
app.use("/api/client", require("./routes/client"));
app.use("/api/users", require("./routes/users"));

//resolve static folder for react app
app.use(express.static("front-app/build"));

//send index to client
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "front-app", "build", "index.html"));
});

app.listen(5000, function () {
  console.log("Listening on port 5000!");
});

//for mocha testing
module.exports = app;
