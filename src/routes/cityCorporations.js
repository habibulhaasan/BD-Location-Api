const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");

const router = express.Router();

// GET /v1/city-corporations
router.get("/", (req, res) => {
  ok(res, store.tables.cityCorporations, { total: store.tables.cityCorporations.length });
});

// GET /v1/city-corporations/:id
router.get("/:id", (req, res) => {
  const cc = store.byId.cityCorporation.get(req.params.id);
  if (!cc) return notFound(res, "city corporation", req.params.id);
  ok(res, cc);
});

// GET /v1/city-corporations/:id/thanas
// Only Dhaka North & South are broken down to thana level in this
// dataset (26 + 24, verified non-overlapping) — the other 11 city
// corporations return an empty list rather than a guess.
router.get("/:id/thanas", (req, res) => {
  const cc = store.byId.cityCorporation.get(req.params.id);
  if (!cc) return notFound(res, "city corporation", req.params.id);
  const rows = store.byParent.thanasByCityCorporation.get(cc.id) || [];
  ok(res, rows);
});

// GET /v1/city-corporations/:id/hospitals
router.get("/:id/hospitals", (req, res) => {
  const cc = store.byId.cityCorporation.get(req.params.id);
  if (!cc) return notFound(res, "city corporation", req.params.id);
  const rows = store.byParent.hospitalsByCityCorporation.get(cc.id) || [];
  ok(res, rows);
});

module.exports = router;
