// SERVER START
import 'dotenv/config';
import app, { verifyDbConnection } from './app.js';

const port = process.env.PORT || 3000;

(async () => {
  // fail fast if DB isn’t reachable from this service
  await verifyDbConnection();
  app.listen(port, () => console.log(`Running on port: ${port}`));
})().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
