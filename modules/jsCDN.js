const url = require("url");
const path = require("path");
const fs = require("fs-extra");
const UglifyJS = require("uglify-js");

var UglifyJSOptions = {
  toplevel: true,
  compress: {
    global_defs: {
      //"@console.log": "alert",
    },
    passes: 2,
  },
  output: {
    beautify: false,
    preamble: "/* uglified */",
  },
};

const cdn = (req, res, app, express) => {
  try {
    const query = url.parse(req.url, true).query;
    let file = url.parse(req.url).pathname;
    let type = req.params.type;

    let filePath = path.join(__dirname, `./../public/${file}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("file_notfound");
    }
    //

    res.contentType(path.basename(filePath));
    //return res.status(200).sendFile(filePath);

    fs.readFile(filePath, (fileErr, code) => {
      let result = UglifyJS.minify(code.toString(), UglifyJSOptions);
      if (fileErr || result.err) {
        return res.status(404).send("file_notfound");
      }
      return res.status(200).send(result.code);
    });
  } catch (e) {
    console.log(e);
    return res.status(404).send("file_notfound");
  }
};

module.exports = { cdn };
