import 'dotenv/config';
import express from 'express';

const REQUIRED_VARS = [
  'OPENAI_API_KEY',
  'UNIBLOCK_API_KEY',
  'PINATA_JWT',
  'EVM_ADDRESS',
];

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT ?? 3000;
const server = app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };
