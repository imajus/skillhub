import 'dotenv/config';
import express from 'express';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm';
import { facilitator } from '@payai/facilitator';
import { declareDiscoveryExtension } from '@x402/extensions/bazaar';
import skillsRouter from './routes/skills.js';

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

const GENERATE_PRICE = '$0.1';
const FETCH_PRICE = '$0.01';
const NETWORK = 'eip155:8453';
const payTo = process.env.EVM_ADDRESS;

const paymentRoutes = {
  'POST /skills/generate': {
    accepts: [{ scheme: 'exact', price: GENERATE_PRICE, network: NETWORK, payTo }],
    extensions: declareDiscoveryExtension({
      method: 'POST',
      bodyType: 'json',
      input: { contractAddress: 'Contract address to generate a skill for', chainId: 'EVM chain ID' },
    }),
  },
  'GET /skills/:id': {
    accepts: [{ scheme: 'exact', price: FETCH_PRICE, network: NETWORK, payTo }],
    extensions: declareDiscoveryExtension({
      method: 'GET',
      pathParams: { id: 'Skill CID on IPFS' },
    }),
  },
};

const app = express();
app.use(express.json());
app.use(paymentMiddlewareFromConfig(
  paymentRoutes,
  facilitator,
  [{ network: NETWORK, server: new ExactEvmScheme() }],
));
app.use('/skills', skillsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT ?? 3000;
const server = app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };
