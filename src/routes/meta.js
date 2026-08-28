const express = require("express");
const store = require("../data-store");
const { ok } = require("../utils/respond");

const router = express.Router();

// GET /v1/stats
router.get("/stats", (req, res) => {
  const { divisions, districts, upazilas, unions, cityCorporations, thanas, pourashavas, hospitals } =
    store.tables;

  const pourashavasWithConfirmedWards = pourashavas.filter((p) => p.ward_count != null).length;
  const pourashavasPlacedUnderUpazila = pourashavas.filter((p) => p.upazila_id != null).length;
  const hospitalsLinked = hospitals.filter((h) => h.division_id != null).length;

  ok(res, {
    divisions: divisions.length,
    districts: districts.length,
    upazilas: upazilas.length,
    unions: unions.length,
    union_wards: unions.length * 9,
    city_corporations: cityCorporations.length,
    thanas: thanas.length,
    pourashavas: pourashavas.length,
    pourashavas_placed_under_upazila: pourashavasPlacedUnderUpazila,
    pourashavas_unplaced: pourashavas.length - pourashavasPlacedUnderUpazila,
    pourashavas_with_confirmed_ward_count: pourashavasWithConfirmedWards,
    hospitals: hospitals.length,
    hospitals_linked_to_geography: hospitalsLinked,
    hospitals_unlinked: hospitals.length - hospitalsLinked,
  });
});

module.exports = router;
