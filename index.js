const express = require("express");
const bodyParser = require("body-parser");
const crypto = require('crypto')
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

const getWebhookVerification = () => {
  return (req, res, buf, encoding) => {
    try {
      if (req.originalUrl === "/webhooks") {
        const rawBody = buf.toString(encoding);
        const signature = req.header('X-HubSpot-Signature');

        const secret = process.env.APP_SECRET;
        const hash = crypto
          .createHash("sha256")
          .update(secret + rawBody)
          .digest("hex");

        if (signature === hash) return;
      }
    } catch (e) {
      console.log(e);
    }

    throw new Error("Unauthorized webhook or error with request processing!");
  };
};

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
    verify: getWebhookVerification(),
  })
);

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

app.post("/webhooks", (req, res) => {
  console.log(req.body);
});
