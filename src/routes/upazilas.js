const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/upazilas
router.get("/", (req, res) => {
  const { items, meta } = paginate(store.tables.upazilas, req.query);
  ok(res, items, meta);
});

// GET /v1/upazilas/:id
router.get("/:id", (req, res) => {
  const upazila = store.byId.upazila.get(req.params.id);
  if (!upazila) return notFound(res, "upazila", req.params.id);
  ok(res, upazila);
});

// GET /v1/upazilas/:id/unions
router.get("/:id/unions", (req, res) => {
  const upazila = store.byId.upazila.get(req.params.id);
  if (!upazila) return notFound(res, "upazila", req.params.id);
  const rows = store.byParent.unionsByUpazila.get(upazila.id) || [];
  const { items, meta } = paginate(rows, req.query);
  ok(res, items, meta);
});

// GET /v1/upazilas/:id/pourashavas
// Almost every upazila has at most one pourashava, but the shape is a
// list for consistency with every other relationship in this API.
router.get("/:id/pourashavas", (req, res) => {
  const upazila = store.byId.upazila.get(req.params.id);
  if (!upazila) return notFound(res, "upazila", req.params.id);
  const rows = store.byParent.pourashavasByUpazila.get(upazila.id) || [];
  ok(res, rows);
});

// GET /v1/upazilas/:id/hospitals
router.get("/:id/hospitals", (req, res) => {
  const upazila = store.byId.upazila.get(req.params.id);
  if (!upazila) return notFound(res, "upazila", req.params.id);
  const rows = store.byParent.hospitalsByUpazila.get(upazila.id) || [];
  ok(res, rows);
});

module.exports = router;
