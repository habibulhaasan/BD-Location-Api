const express = require("express");
const store = require("../data-store");
const { ok, badRequest } = require("../utils/respond");
const { paginate } = require("../utils/paginate");

const router = express.Router();

const SEARCHABLE = [
  { type: "division", rows: store.tables.divisions },
  { type: "district", rows: store.tables.districts },
  { type: "upazila", rows: store.tables.upazilas },
  { type: "union", rows: store.tables.unions },
  { type: "pourashava", rows: store.tables.pourashavas },
  { type: "city_corporation", rows: store.tables.cityCorporations },
  { type: "thana", rows: store.tables.thanas },
  { type: "hospital", rows: store.tables.hospitals },
];

// GET /v1/search?q=<term>&type=<optional tier filter>
// Matches on name (case-insensitive) or bn_name (exact substring — Bengali
// has no case). Set `type` to restrict to one tier, e.g. type=union.
router.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return badRequest(res, "Query parameter 'q' is required.");
  const typeFilter = req.query.type;
  const lowerQ = q.toLowerCase();

  let results = [];
  for (const { type, rows } of SEARCHABLE) {
    if (typeFilter && typeFilter !== type) continue;
    for (const r of rows) {
      const bnField = r.bn_name || r.name_bn;
      const nameHit = r.name.toLowerCase().includes(lowerQ);
      const bnHit = bnField && bnField.includes(q);
      if (nameHit || bnHit) {
        results.push({ type, ...r });
      }
    }
  }

  const { items, meta } = paginate(results, req.query);
  ok(res, items, { ...meta, query: q, type: typeFilter || "all" });
});

module.exports = router;
