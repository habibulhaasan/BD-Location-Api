const express = require("express");
const store = require("../data-store");
const { ok, notFound } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

// GET /v1/pourashavas
router.get("/", (req, res) => {
  const { items, meta } = paginate(store.tables.pourashavas, req.query);
  ok(res, items, meta);
});

// GET /v1/pourashavas/:id
router.get("/:id", (req, res) => {
  const pourashava = store.byId.pourashava.get(req.params.id);
  if (!pourashava) return notFound(res, "pourashava", req.params.id);
  ok(res, pourashava);
});

// GET /v1/pourashavas/:id/wards
// Unlike unions, pourashava ward counts vary by population (9–39, per
// the Paurashava Ordinance) rather than being fixed. Ward stubs are only
// returned when ward_count was confirmed against BBS's census geocode —
// otherwise this responds 404 rather than guessing a count.
router.get("/:id/wards", (req, res) => {
  const pourashava = store.byId.pourashava.get(req.params.id);
  if (!pourashava) return notFound(res, "pourashava", req.params.id);
  const wards = store.wardsForPourashava(pourashava);
  if (!wards) {
    return res.status(404).json({
      error: {
        code: "WARD_COUNT_UNCONFIRMED",
        message:
          "This pourashava's ward count isn't confirmed by any source in this dataset, so wards can't be listed. See ward_count on the pourashava resource (null here).",
      },
    });
  }
  ok(res, wards, { source: "BBS census geocode (exact row count)" });
});

module.exports = router;
