// Load dotenv package
require("dotenv").config();

// Load required module
//const fs = require("fs");
const path = require("path");

const express = require("express");
const app = express();
const uuid = require("uuid");

const multer = require("multer");
const fs = require("fs-extra");
const compression = require("compression");
const helmet = require("helmet");

// Use cors middleware to allow/disallow
const cors = require("cors");
const corsOptions = {
  origin:
    process.env.APP_ORIGIN && process.env.APP_ORIGIN != "*"
      ? process.env.APP_ORIGIN.split(",")
      : "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const { rateLimiterMiddleware } = require("./src/services/antiddosService");

app.use(rateLimiterMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// error handler

app.use("js", express.static(__dirname + "/public/js"));
app.use(compression());
app.use(helmet());

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      let type = req.params.type;
      let _path = path.join(__dirname, `./public/${type}`);
      fs.mkdirsSync(_path);
      callback(null, _path);
    },
    filename: (req, file, callback) => {
      //originalname is the uploaded file's name with extn
      if (req.body.originalname) {
        var filaName = uuid.v4() + path.extname(file.originalname);
      } else {
        var filaName = file.originalname;
      }
      callback(null, filaName);
    },
  }),
});

const uploadFiles = (req, res) => {
  let files = req.files.map((f) => {
    return {
      name: f.filename,
      mimetype: f.mimetype,
    };
  });

  res.json({ success: true, message: "Successfully uploaded files", files });
};

const uploadFile = (req, res) => {
  let file = {
    name: req.file.filename,
    mimetype: req.file.mimetype,
  };

  res.json({ success: true, message: "Successfully uploaded file", file });
};

app.post("/upload-files/:type", upload.array("files"), uploadFiles);
app.post("/upload-file/:type", upload.single("file"), uploadFile);

app.get("/:type/*", async function (req, res) {
  // Remove headers info
  res.removeHeader("Transfer-Encoding");
  res.removeHeader("X-Powered-By");

  let type = req.params.type;

  let cdnModule = `./modules/${type}CDN.js`;

  if (!fs.existsSync(cdnModule)) {
    return res.status(404).send("cdn_type_notfound");
  }

  const { cdn } = require(cdnModule);
  return cdn(req, res, app, express);
});
app.listen(process.env.PORT);
