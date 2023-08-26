const Jimp = require("jimp");
const url = require("url");
const path = require("path");
const fs = require("fs-extra");

const cdn = (req, res) => {
  try {
    const query = url.parse(req.url, true).query;
    let file = url.parse(req.url).pathname;

    let filePath = path.join(__dirname, `./../public/${file}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("image_notfound");
    }

    const height = parseInt(query.h) || 0; // Get height from query string
    const width = parseInt(query.w) || 0; // Get width from query string
    const quality = parseInt(query.q) < 100 ? parseInt(query.q) : 99; // Get quality from query string

    const folder = `q${quality}_h${height}_w${width}`;
    const out_file = `public/image/thumb/${folder}/${file}`;
    console.log(out_file);
    if (fs.existsSync(path.resolve(out_file))) {
      res.sendFile(path.resolve(out_file));
      return;
    }

    // If no height or no width display original image
    if (!height || !width) {
      res.sendFile(path.resolve(`public/${file}`));
      return;
    }

    // Use jimp to resize image
    Jimp.read(path.resolve(`public/${file}`))
      .then((lenna) => {
        lenna.resize(width, height); // resize
        lenna.quality(quality); // set JPEG quality

        lenna.write(path.resolve(out_file), () => {
          fs.createReadStream(path.resolve(out_file)).pipe(res);
        }); // save and display
      })
      .catch((err) => {
        res.status(404).send("image_notfound");
      });
  } catch (e) {
    return res.status(404).send("image_notfound");
  }
};

module.exports = { cdn };
