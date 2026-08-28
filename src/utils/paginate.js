// Simple offset pagination via ?page=&per_page=, applied uniformly across
// every list endpoint. Defaults to page 1 / 50 per page; per_page is
// capped at 500 to keep responses bounded regardless of what a client asks
// for (unions alone number 4,540 — an unbounded request would be a
// self-inflicted denial-of-service).

const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 500;

function paginate(rows, query) {
  let page = parseInt(query.page, 10);
  let perPage = parseInt(query.per_page, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(perPage) || perPage < 1) perPage = DEFAULT_PER_PAGE;
  if (perPage > MAX_PER_PAGE) perPage = MAX_PER_PAGE;

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const items = rows.slice(start, start + perPage);

  return {
    items,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
  };
}

module.exports = { paginate, DEFAULT_PER_PAGE, MAX_PER_PAGE };
