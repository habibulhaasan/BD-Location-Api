const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/unions
router.get("/", (req, res) => {
  const { items, meta } = paginate(store.tables.unions, req.query);
  ok(res, items, meta);
});

// GET /v1/unions/:id
router.get("/:id", (req, res) => {
  const union = store.byId.union.get(req.params.id);
  if (!union) return notFound(res, "union", req.params.id);
  ok(res, union);
});

// GET /v1/unions/:id/wards
// Every union has exactly 9 wards by law (Union Parishad Act 2009).
// These aren't stored rows — they're generated on request.
router.get("/:id/wards", (req, res) => {
  const union = store.byId.union.get(req.params.id);
  if (!union) return notFound(res, "union", req.params.id);
  ok(res, store.wardsForUnion(union), {
    source: "Union Parishad Act 2009 — every union has 9 wards by law",
  });
});

module.exports = router;
