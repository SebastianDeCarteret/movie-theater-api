const app = require("./src/app");
const port = 3000;
const { db } = require("./db/connection");
const { syncSeed } = require("./db/seed");
// Express Routes - examples

app.listen(port, async () => {
  await syncSeed();
  await db.sync();
  console.log(`App listening on port ${port}`);
});
