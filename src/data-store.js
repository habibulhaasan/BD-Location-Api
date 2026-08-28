// Loads every data table once at startup and builds simple in-memory
// indexes (by id, and by parent id) so every route is an O(1) lookup.
// The dataset is small enough (~5,500 records total) that this is the
// right tradeoff — no database needed.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function load(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function indexById(rows) {
  const map = new Map();
  for (const r of rows) map.set(r.id, r);
  return map;
}

function indexByParent(rows, parentKey) {
  const map = new Map();
  for (const r of rows) {
    const key = r[parentKey];
    if (key == null) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  return map;
}

const divisions = load("divisions");
const districts = load("districts");
const upazilas = load("upazilas");
const unions = load("unions");
const cityCorporations = load("city_corporations");
const thanas = load("thanas");
const pourashavas = load("pourashavas");
const hospitals = load("hospitals");

const byId = {
  division: indexById(divisions),
  district: indexById(districts),
  upazila: indexById(upazilas),
  union: indexById(unions),
  cityCorporation: indexById(cityCorporations),
  thana: indexById(thanas),
  pourashava: indexById(pourashavas),
  hospital: indexById(hospitals),
};

const byParent = {
  districtsByDivision: indexByParent(districts, "division_id"),
  upazilasByDistrict: indexByParent(upazilas, "district_id"),
  unionsByUpazila: indexByParent(unions, "upazila_id"),
  cityCorporationsByDistrict: indexByParent(cityCorporations, "district_id"),
  thanasByCityCorporation: indexByParent(thanas, "city_corporation_id"),
  pourashavasByUpazila: indexByParent(pourashavas, "upazila_id"),
  pourashavasByDistrict: indexByParent(pourashavas, "district_id"),
  hospitalsByDivision: indexByParent(hospitals, "division_id"),
  hospitalsByDistrict: indexByParent(hospitals, "district_id"),
  hospitalsByUpazila: indexByParent(hospitals, "upazila_id"),
  hospitalsByCityCorporation: indexByParent(hospitals, "city_corporation_id"),
};

// Every union has exactly 9 wards by law (Union Parishad Act 2009) — not
// stored as rows, generated on request instead.
function wardsForUnion(union) {
  return Array.from({ length: union.ward_count || 9 }, (_, i) => ({
    id: `${union.id}-w${i + 1}`,
    union_id: union.id,
    number: i + 1,
    name: `Ward ${i + 1}`,
    bn_name: `ওয়ার্ড ${toBnNumber(i + 1)}`,
  }));
}

// Pourashava ward counts vary by population (9–39, per the Paurashava
// Ordinance) — only generate ward stubs when we have a confirmed count.
function wardsForPourashava(pourashava) {
  if (!pourashava.ward_count) return null;
  return Array.from({ length: pourashava.ward_count }, (_, i) => ({
    id: `${pourashava.id}-w${i + 1}`,
    pourashava_id: pourashava.id,
    number: i + 1,
    name: `Ward ${i + 1}`,
    bn_name: `ওয়ার্ড ${toBnNumber(i + 1)}`,
  }));
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBnNumber(n) {
  return String(n)
    .split("")
    .map((d) => BN_DIGITS[Number(d)])
    .join("");
}

module.exports = {
  tables: { divisions, districts, upazilas, unions, cityCorporations, thanas, pourashavas, hospitals },
  byId,
  byParent,
  wardsForUnion,
  wardsForPourashava,
};
