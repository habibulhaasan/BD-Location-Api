const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const divisionsRouter = require("./routes/divisions");
const districtsRouter = require("./routes/districts");
const upazilasRouter = require("./routes/upazilas");
const unionsRouter = require("./routes/unions");
const pourashavasRouter = require("./routes/pourashavas");
const cityCorporationsRouter = require("./routes/cityCorporations");
const hospitalsRouter = require("./routes/hospitals");
const searchRouter = require("./routes/search");
const metaRouter = require("./routes/meta");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(compression());
app.disable("x-powered-by");

// Generous default: 300 requests/minute per IP. This is a free, public,
// read-only dataset — the limit exists to prevent accidental abuse (e.g.
// a client polling in a tight loop), not to gate legitimate use. Tune to
// taste in your deployment.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.static("public", { index: false }));

app.get("/", (req, res) => {
  res.json({
    name: "bd-geo-api",
    description:
      "Bangladesh administrative geography — division, district, upazila, union, ward, pourashava, city corporation, and hospital facility data.",
    version: "v1",
    documentation: "/v1",
    tree_view: "/index.html",
  });
});

app.get("/v1", (req, res) => {
  res.json({
    resources: {
      divisions: "/v1/divisions",
      districts: "/v1/districts",
      upazilas: "/v1/upazilas",
      unions: "/v1/unions",
      pourashavas: "/v1/pourashavas",
      city_corporations: "/v1/city-corporations",
      hospitals: "/v1/hospitals",
      search: "/v1/search?q=",
      stats: "/v1/stats",
    },
    openapi_spec: "/openapi.yaml",
    tree_view: "/index.html",
  });
});

app.use("/v1/divisions", divisionsRouter);
app.use("/v1/districts", districtsRouter);
app.use("/v1/upazilas", upazilasRouter);
app.use("/v1/unions", unionsRouter);
app.use("/v1/pourashavas", pourashavasRouter);
app.use("/v1/city-corporations", cityCorporationsRouter);
app.use("/v1/hospitals", hospitalsRouter);
app.use("/v1/search", searchRouter);
app.use("/v1", metaRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
