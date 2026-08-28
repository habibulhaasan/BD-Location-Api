const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/districts
router.get("/", (req, res) => {
  const { items, meta } = paginate(store.tables.districts, req.query);
  ok(res, items, meta);
});

// GET /v1/districts/:id
router.get("/:id", (req, res) => {
  const district = store.byId.district.get(req.params.id);
  if (!district) return notFound(res, "district", req.params.id);
  ok(res, district);
});

// GET /v1/districts/:id/upazilas
router.get("/:id/upazilas", (req, res) => {
  const district = store.byId.district.get(req.params.id);
  if (!district) return notFound(res, "district", req.params.id);
  const rows = store.byParent.upazilasByDistrict.get(district.id) || [];
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

// GET /v1/districts/:id/city-corporations
router.get("/:id/city-corporations", (req, res) => {
  const district = store.byId.district.get(req.params.id);
  if (!district) return notFound(res, "district", req.params.id);
  const rows = store.byParent.cityCorporationsByDistrict.get(district.id) || [];
  ok(res, rows);
});

// GET /v1/districts/:id/pourashavas
// Pourashavas whose parent upazila could not be confirmed by any source
// are attached directly to their district instead of being dropped.
router.get("/:id/pourashavas", (req, res) => {
  const district = store.byId.district.get(req.params.id);
  if (!district) return notFound(res, "district", req.params.id);
  const rows = store.byParent.pourashavasByDistrict.get(district.id) || [];
  ok(res, rows);
});

// GET /v1/districts/:id/hospitals
router.get("/:id/hospitals", (req, res) => {
  const district = store.byId.district.get(req.params.id);
  if (!district) return notFound(res, "district", req.params.id);
  const rows = store.byParent.hospitalsByDistrict.get(district.id) || [];
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

module.exports = router;
