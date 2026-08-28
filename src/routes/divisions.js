const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/divisions
router.get("/", (req, res) => {
  const { items, meta } = paginate(store.tables.divisions, req.query);
  ok(res, items, meta);
});

// GET /v1/divisions/:id
router.get("/:id", (req, res) => {
  const division = store.byId.division.get(req.params.id);
  if (!division) return notFound(res, "division", req.params.id);
  ok(res, division);
});

// GET /v1/divisions/:id/districts
router.get("/:id/districts", (req, res) => {
  const division = store.byId.division.get(req.params.id);
  if (!division) return notFound(res, "division", req.params.id);
  const rows = store.byParent.districtsByDivision.get(division.id) || [];
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

// GET /v1/divisions/:id/hospitals
router.get("/:id/hospitals", (req, res) => {
  const division = store.byId.division.get(req.params.id);
  if (!division) return notFound(res, "division", req.params.id);
  const rows = store.byParent.hospitalsByDivision.get(division.id) || [];
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

module.exports = router;
