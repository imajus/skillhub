import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';
import { model } from './model.js';
import { fetchABI, fetchSourceCode, detectERCPatterns } from '../tools/uniblock.js';

export async function research(contractAddress, chainId) {
  let abi, source, ercPatterns;

  const tools = [
    tool(
      async ({ address, chain }) => {
        abi = await fetchABI(address, chain);
        return JSON.stringify(abi);
      },
      {
        name: 'fetchABI',
        description: 'Fetch the parsed ABI for a smart contract from Uniblock.',
        schema: z.object({ address: z.string(), chain: z.number() }),
      }
    ),
    tool(
      async ({ address, chain }) => {
        source = await fetchSourceCode(address, chain);
        return source ?? 'Source not verified';
      },
      {
        name: 'fetchSourceCode',
        description: 'Fetch verified Solidity source code for a smart contract. Returns null if unverified.',
        schema: z.object({ address: z.string(), chain: z.number() }),
      }
    ),
    tool(
      async ({ abiJson }) => {
        ercPatterns = detectERCPatterns(JSON.parse(abiJson));
        return JSON.stringify(ercPatterns);
      },
      {
        name: 'detectERCPatterns',
        description: 'Detect ERC standards (ERC-20, ERC-721, ERC-1155) from an ABI JSON string.',
        schema: z.object({ abiJson: z.string().describe('ABI array as JSON string') }),
      }
    ),
  ];

  const agent = createReactAgent({ llm: model, tools });

  await agent.invoke({
    messages: [{
      role: 'user',
      content: `Research the smart contract at ${contractAddress} on chainId ${chainId}. Call fetchABI, fetchSourceCode, and detectERCPatterns (pass the ABI JSON from fetchABI). Summarise your findings.`,
    }],
  }, { callbacks: [new ConsoleCallbackHandler()] });

  return { abi: abi ?? [], source: source ?? null, ercPatterns: ercPatterns ?? [] };
}
