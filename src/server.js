const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`bd-geo-api listening on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/v1/divisions`);
});
