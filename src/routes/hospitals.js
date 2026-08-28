const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/hospitals
// Optional filters: ?agency=DGHS&facility_type=Upazila+Health+Complex
// For location-scoped queries, prefer the nested routes
// (/upazilas/:id/hospitals etc.) — they're indexed and don't need to
// scan the full table.
router.get("/", (req, res) => {
  let rows = store.tables.hospitals;
  if (req.query.agency) {
    rows = rows.filter((h) => h.agency === req.query.agency);
  }
  if (req.query.facility_type) {
    rows = rows.filter((h) => h.facility_type === req.query.facility_type);
  }
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

// GET /v1/hospitals/:id
router.get("/:id", (req, res) => {
  const hospital = store.byId.hospital.get(req.params.id);
  if (!hospital) return notFound(res, "hospital", req.params.id);
  ok(res, hospital);
});

module.exports = router;
