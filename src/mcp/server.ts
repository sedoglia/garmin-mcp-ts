// src/mcp/server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolDefinitions } from './tools.js';
import { SERVER_NAME, SERVER_VERSION } from '../utils/constants.js';
import { redactArgs } from '../utils/credentials.js';
import { ToolHandler } from './handlers.js';
import { AuthManager } from '../garmin/auth.js';
import logger from '../utils/logger.js';

export async function createMCPServer(auth: AuthManager): Promise<Server> {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolHandler = new ToolHandler(auth);

  // Handler per listare i tool disponibili.
  //
  // title e annotations viaggiano con ogni tool: la directory MCP legge la
  // risposta di tools/list e raggruppa i tool per annotation, quindi un tool
  // senza title o senza readOnlyHint/destructiveHint risulta non annotato
  // anche se la annotation esiste qui nel sorgente.
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools');
    return {
      tools: toolDefinitions.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: {
          title: tool.title,
          ...tool.annotations,
          // Ogni tool, credenziali comprese, parla con connect.garmin.com:
          // il dominio su cui operano non è chiuso e locale.
          openWorldHint: true,
        },
      })),
    };
  });

  // Handler per eseguire i tool
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const toolName = request.params.name;
    const toolArgs = request.params.arguments;

    logger.info(`Tool called: ${toolName}`);
    logger.info(`Arguments received: ${JSON.stringify(redactArgs(toolArgs))}`);

    try {
      // Passa gli argomenti direttamente all'handler
      const result = await toolHandler.handle(toolName, toolArgs as Record<string, unknown> | undefined);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error(`Error executing tool ${toolName}: ${error}`);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error,
              tool: toolName,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runServer(auth: AuthManager): Promise<void> {
  logger.info('Starting Garmin MCP Server...');

  try {
    const server = await createMCPServer(auth);
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Garmin MCP Server running!');
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error('Failed to start server: ' + error);
    throw err;
  }
}
