/**
 * Imports dependencies
 */
const cors = require("cors");
const express = require("express");
const { json, urlencoded } = require("express");
const morgan = require("morgan");
const httpError = require("http-errors");
const fetch = require("node-fetch");

/**
 * Extracts environment variables
 */
const { PORT = 3000 } = process.env;

/**
 * Initializes Express server instance
 */
const app = express();
app.use(cors());
app.use(morgan("dev"));
/*
app.use((_req, res, next) => {
  const ip = getIpFromRequest(_req);
  const maskedIp = ip.replaceAll(".", "_");
  _req.userip = maskedIp;
  next();
});

app.use("/api", json(), auth);
app.use("/api", json(), employee);
app.use("/api", json(), brand);*/

/**
 * Handles a home route
 */

app.get("/", (_req, res) => {
  res.status(200).send("ok");
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

const updateFetchOptions = (options) => {
  const update = { ...options };
  update.headers = {
    ...update.headers,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-VTEX-API-AppKey": "vtexappkey-philips-OGQULY",
    "X-VTEX-API-AppToken":
      "GWWEIYYZTTUSLWVFXZEOQABIOBQNUZIKDRBNGSNTVOJMAEJEFOMKQIMFUOPGIKFTKJOTUHZFMLTCRPHJSLIGNYUVFWSSCGKKJPBRPPKXPGYFOJNFGGNXCYGMOTOXPGCF",
  };
  return update;
};

app.get("/teste", async (_req, res) => {
  const options = {
    method: "GET",
  };

  try {
    const response = await fetch(
      "https://philips.vtexcommercestable.com.br/api/oms/pvt/orders?per_page=200&f_creationDate=creationDate%3A%5B2023-01-26T02%3A00%3A00.000Z%20TO%202023-03-27T01%3A59%3A59.999Z%5D&f_paymentNames=Mastercard&f_status=payment-approved",
      updateFetchOptions(options)
    );
    const json = await response.json();
    console.log(json);
    res.status(200).json(json);
  } catch (e) {
    res.status(200).send(e);
  }
});

/**
 * Listens on a specific port
 */
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
