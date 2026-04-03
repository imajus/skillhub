import 'dotenv/config';
import express from 'express';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { facilitator as payaiFacilitator } from '@payai/facilitator';
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

const facilitatorClient = new HTTPFacilitatorClient(payaiFacilitator);
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

const paymentRoutes = {
  'POST /skills/generate': {
    accepts: { scheme: 'exact', price: GENERATE_PRICE, network: NETWORK, payTo },
    ...declareDiscoveryExtension({
      method: 'POST',
      bodyType: 'json',
      input: { contractAddress: 'Contract address to generate a skill for', chainId: 'EVM chain ID' },
    }),
  },
  'GET /skills/:id': {
    accepts: { scheme: 'exact', price: FETCH_PRICE, network: NETWORK, payTo },
    ...declareDiscoveryExtension({
      method: 'GET',
      pathParams: { id: 'Skill CID on IPFS' },
    }),
  },
};

const app = express();
app.use(express.json());
app.use(paymentMiddleware(paymentRoutes, resourceServer));
app.use('/skills', skillsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

export { app };
