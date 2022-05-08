const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const corsOptions = {
  origin: ["http://localhost:3000"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true }));

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_ID,
    pass: process.env.SENDER_PASS,
  },
});

app.get("/api/test", async (req, res) => {
  res.send({ status: true });
});

app.post("/api/upload", async (req, res) => {
  try {
    let { name } = req.body;
    let file = req.files.img;
    console.log(name, file);
    cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
      if (err) throw { message: "cloudnary error", success: false };
      let mailOptions = {
        from: process.env.SENDER_ID,
        to: process.env.RECEIVE_ID,
        subject: "Name : " + name,
        html: `<div>
                <h2><a href=${result.url}>Image URL</a></h2>
                <img style="height:${result.height};width:${result.width};" src=${result.url} alt="user" ></img>
              </div> 
                `,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw { message: "mail error", success: false };
        throw { message: "successfully sent ", success: true };
      });
    });
    return res.send({ message: "successfully sent ", success: true });
  } catch (e) {
    return res.send(e);
  }
});
app.listen(process.env.PORT, () =>
  console.log(`app is listening port ${process.env.PORT}`)
);
