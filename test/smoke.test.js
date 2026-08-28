const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const app = require("../src/app");

function withServer(fn) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const { port } = server.address();
      try {
        await fn(`http://127.0.0.1:${port}`);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
}

async function getJson(url) {
  const res = await fetch(url);
  return { status: res.status, body: await res.json() };
}

test("GET /v1/divisions returns 8 divisions paginated", async () => {
  await withServer(async (base) => {
    const { status, body } = await getJson(`${base}/v1/divisions`);
    assert.strictEqual(status, 200);
    assert.strictEqual(body.meta.total, 8);
    assert.ok(Array.isArray(body.data));
  });
});

test("GET /v1/divisions/:id/districts 404s on a bad id", async () => {
  await withServer(async (base) => {
    const { status, body } = await getJson(`${base}/v1/divisions/nope/districts`);
    assert.strictEqual(status, 404);
    assert.strictEqual(body.error.code, "NOT_FOUND");
  });
});

test("GET /v1/unions/:id/wards always returns exactly 9 wards", async () => {
  await withServer(async (base) => {
    const list = await getJson(`${base}/v1/unions?per_page=1`);
    const unionId = list.body.data[0].id;
    const { status, body } = await getJson(`${base}/v1/unions/${unionId}/wards`);
    assert.strictEqual(status, 200);
    assert.strictEqual(body.data.length, 9);
  });
});

test("GET /v1/search?q= requires a query", async () => {
  await withServer(async (base) => {
    const { status, body } = await getJson(`${base}/v1/search`);
    assert.strictEqual(status, 400);
    assert.strictEqual(body.error.code, "BAD_REQUEST");
  });
});

test("GET /v1/stats reflects real dataset totals", async () => {
  await withServer(async (base) => {
    const { status, body } = await getJson(`${base}/v1/stats`);
    assert.strictEqual(status, 200);
    assert.strictEqual(body.data.divisions, 8);
    assert.strictEqual(body.data.unions, 4540);
    assert.strictEqual(body.data.hospitals, 2617);
  });
});

test("GET /v1/upazilas/:id/hospitals returns hospitals linked to that upazila", async () => {
  await withServer(async (base) => {
    const { status, body } = await getJson(`${base}/v1/upazilas/upz-266/hospitals`);
    assert.strictEqual(status, 200);
    assert.ok(body.data.length > 0);
    assert.ok(body.data.every((h) => h.upazila_id === "upz-266"));
  });
});
