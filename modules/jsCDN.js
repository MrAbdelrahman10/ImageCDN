const url = require("url");
const path = require("path");
const fs = require("fs-extra");
const minify = require("express-minify");

const cdn = (req, res, app, express) => {
  express.static.mime.define({
    "text/javascript": ["js"],
  });
  app.use(
    minify({
      cache: false,
      uglifyJsModule: null,
      jsMatch: /js/,
    })
  );
  try {
    const query = url.parse(req.url, true).query;
    let file = url.parse(req.url).pathname;
    let type = req.params.type;

    let filePath = path.join(__dirname, `./../public/${file}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("file_notfound");
    }

    res.set("Content-Type", "text/javascript");

    fs.readFile(filePath, (fileErr, result) => {
      if (fileErr) {
        return res.status(404).send("file_notfound");
      }

      return res.status(200).end(result);
    });
  } catch (e) {
    console.log(e);
    return res.status(404).send("file_notfound");
  }
};

module.exports = { cdn };
