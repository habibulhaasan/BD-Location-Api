// Every successful response uses the same envelope:
//   { data: <object|array>, meta: {...} }
// Every error response uses:
//   { error: { code, message } }
// This keeps clients from having to special-case "is this a list or an
// object" or "did this fail" — the shape is predictable everywhere.

function ok(res, data, meta = undefined) {
  const body = meta ? { data, meta } : { data };
  res.json(body);
}

function notFound(res, resource, id) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `${resource} '${id}' was not found.`,
    },
  });
}

function badRequest(res, message) {
  res.status(400).json({
    error: { code: "BAD_REQUEST", message },
  });
}

module.exports = { ok, notFound, badRequest };
