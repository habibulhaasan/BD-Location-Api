# bd-geo-api

A free, open REST API for Bangladesh's administrative geography:
**division → district → upazila → (union → ward) / (pourashava → ward)**,
city corporations broken down to thana level for Dhaka North & South, and
**2,617 government health facilities** linked into the same hierarchy.
Bilingual (English + Bengali) wherever a name is confirmed by a source.

```
GET /v1/divisions
GET /v1/divisions/div-3/districts
GET /v1/districts/dis-47/upazilas
GET /v1/upazilas/upz-123/unions
GET /v1/upazilas/upz-123/pourashavas
GET /v1/upazilas/upz-123/hospitals
GET /v1/unions/uni-456/wards
GET /v1/search?q=savar
```

A live tree view of the whole thing, built entirely from these endpoints
(nothing pre-loaded — open the network tab and watch it fetch), is served
at **`/index.html`** once the server is running.

## Quick start

```bash
git clone <this-repo>
cd bd-geo-api
npm install
npm start
# -> bd-geo-api listening on http://localhost:3000
curl http://localhost:3000/v1/divisions
open http://localhost:3000/index.html   # the tree view
```

No database, no API key, no build step — the dataset is ~8,100 records
loaded into memory at startup from the JSON files in `data/`.

## API design conventions

These are the rules this API follows. If you're extending it, keep
following them — consistency is the whole point of a "guideline."

**Versioning.** Every route lives under `/v1`. Breaking changes get a new
`/v2`; `/v1` keeps working. Don't change response shapes in place.

**Resources, not verbs.** URLs name things (`/divisions`, `/unions`), not
actions (`/getDivisions`). Nesting expresses real parent-child
relationships: `/upazilas/:id/unions`, not `/unions?upazila_id=`. Both
exist here where it's ambiguous which a client wants — see each router.

**Response envelope.** Every success response is:
```json
{ "data": ... }
```
or, for paginated lists:
```json
{ "data": [...], "meta": { "page": 1, "per_page": 50, "total": 4540, "total_pages": 91 } }
```
Every error response is:
```json
{ "error": { "code": "NOT_FOUND", "message": "..." } }
```
A client can always check for `error` vs `data` without guessing.

**Pagination.** Any endpoint that can return more than a screenful is
paginated via `?page=&per_page=` (default 50, max 500 per page — capped
server-side so a client can't accidentally request all 4,540 unions in
one call and hang the connection). Small, bounded collections (13 city
corporations, a district's upazilas) return unpaginated for simplicity —
see `openapi.yaml` for which is which.

**IDs are stable strings, not array indexes.** `div-3`, `dis-47`,
`upz-123` — prefixed by type so an id is self-describing and can never
collide across tables.

**Errors use HTTP status + a machine-readable code.** `404` with
`NOT_FOUND` for a missing resource, `400` with `BAD_REQUEST` for a bad
query param, `500` with `INTERNAL_ERROR` for anything unexpected. Check
`error.code`, not the human-readable message, if you're branching on it
in code.

**Don't guess — return what's confirmed, and say when something isn't.**
This shows up twice in the data itself:
- `GET /pourashavas/:id/wards` returns `404 WARD_COUNT_UNCONFIRMED`
  instead of a made-up ward list, for the 22 pourashavas whose exact
  ward count isn't in any source this API was built from.
- Pourashavas whose upazila couldn't be confirmed live under
  `/districts/:id/pourashavas` instead of being force-fit into the wrong
  upazila or silently dropped.

**CORS is open, rate limiting is generous.** This is public government
geo-data, not something to gate behind auth. `cors()` allows any origin;
a 300 req/min per-IP limit exists only to blunt accidental abuse loops —
tune both in `src/app.js` for your deployment.

## Resources

| Resource | Count | Notes |
|---|---|---|
| Divisions | 8 | |
| Districts | 64 | |
| Upazilas | 494 | |
| Unions | 4,540 | every union has exactly 9 wards, generated on request |
| Pourashavas | 334 | 325 placed under a confirmed upazila, 9 at district level |
| City corporations | 13 | Dhaka North & South further split into thanas |
| Thanas | 50 | 26 (Dhaka North) + 24 (Dhaka South) only |
| Hospitals | 2,617 | DGHS facility registry; 2,615 linked into the geography above |

Full endpoint list, parameters, and schemas: [`openapi.yaml`](./openapi.yaml)
(paste it into [editor.swagger.io](https://editor.swagger.io) for an
interactive view), or hit `GET /v1` for a live index.

## Data provenance — read this before treating anything here as ground truth

This dataset was assembled from several government and open sources, not
one authoritative feed, because no single public source covers this full
hierarchy. Specifically:

- **Division/district/upazila/union base layer**: a compiled open
  administrative geocode dataset (division → district → upazila → union),
  bilingual.
- **Pourashava → upazila placement + exact ward counts**: Bangladesh
  Bureau of Statistics' census geocode file, matched by administrative
  code (not name-matching) wherever possible.
- **Pourashava category (A/B/C)**: LGED's 2019 division-wise pourashava
  list.
- **City corporation thana breakdown**: Wikipedia's infobox data for each
  city corporation, cross-checked for zero overlap between Dhaka North
  and South.
- **Hospitals**: DGHS's (Directorate General of Health Services) facility
  registry, a user-supplied export. DGHS uses its own internal
  division/district/upazila numbering, which does **not** match this
  API's ids — so every hospital was re-linked by cross-referencing text
  clues in the source data (upazila name fields, "Unions of X Upazila"
  / "X Paurasava" text, thana names for city-corp facilities, and a
  district-code crosswalk derived by majority vote across each
  district's own facilities) against this API's existing, already-cited
  geography. **2,615 of 2,617 facilities (99.9%) resolved**; the 2 that
  didn't are visible via `GET /v1/hospitals` with `division_id: null` —
  one (Indurkani Upazila Health Complex) is in an upazila that doesn't
  exist in this API's base geocode source at all (Indurkani is a
  relatively new upazila split off from Nazirpur/Zianagar), the other
  (Chattogram Divisional Laboratory) had no location signal whatsoever
  in the source export.

Known, documented gaps — all surfaced in the API itself rather than
papered over:
- **9 of 334 pourashavas** couldn't be tied to a specific upazila by
  either source. They're listed at district level via
  `/districts/:id/pourashavas`.
- **22 of 334 pourashavas** have no confirmed ward count.
  `/pourashavas/:id/wards` returns 404 for these rather than a guess.
- **~6 pourashavas** may be near-duplicates from imperfect fuzzy-matching
  between the two source lists (BBS's census-era data vs LGED's 2019
  list). Flagged here, not silently fixed.
- **No mouza/village-level or ward-area data.** Real ward-area names
  would require a ~67,000-row national mouza-level geocode this project
  does not have access to. Every "ward" in this API is a numbered
  administrative unit, not a mapped area.
- **11 of 13 city corporations** have no thana breakdown (only Dhaka
  North/South do) — no reliable source was found for the rest.

If you have access to better source data for any of these — especially
an authoritative pourashava-ward mapping, or LGD's own geocode — PRs
that replace a documented gap with a cited source are the most valuable
kind.

## Project layout

```
data/           flat JSON tables (the actual dataset)
public/
  index.html      live tree view — a thin client over /v1, nothing embedded
src/
  data-store.js   loads + indexes data/ once at startup
  app.js          Express app: middleware, routing
  server.js       entry point
  routes/         one file per resource (includes hospitals.js)
  middleware/      404 + error handling
  utils/          pagination, response envelope helpers
openapi.yaml    machine-readable API spec
```

## Deploying

This is a stateless Node process reading local JSON — it runs anywhere
Node runs. No environment variables are required; `PORT` is optional
(defaults to 3000). Common options: Render, Railway, Fly.io, a plain VPS
behind nginx, or a serverless adapter (Vercel/Netlify functions) if you
wrap `src/app.js` accordingly.

## License

Code: MIT (see `LICENSE`). Underlying government data is public
administrative/statistical data; if you redistribute it, please carry
forward the provenance notes above rather than presenting it as your own
primary research.
