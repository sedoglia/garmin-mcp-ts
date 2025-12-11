// src/mcp/server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolDefinitions } from './tools.js';
import { ToolHandler } from './handlers.js';
import { GarminConnectClient } from '../garmin/client.js';
import logger from '../utils/logger.js';

export async function createMCPServer(garminClient: GarminConnectClient): Promise<Server> {
  const server = new Server(
    {
      name: 'garmin-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolHandler = new ToolHandler(garminClient);

  // Handler per listare i tool disponibili
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools');
    return {
      tools: toolDefinitions.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handler per eseguire i tool
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const toolName = request.params.name;
    const toolArgs = request.params.arguments;

    logger.info(`Tool called: ${toolName}`);
    logger.info(`Arguments received: ${JSON.stringify(toolArgs)}`);

    try {
      // Passa gli argomenti direttamente all'handler
      const result = await toolHandler.handle(toolName, toolArgs as Record<string, unknown> | undefined);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
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
            text: JSON.stringify(
              {
                success: false,
                error,
                tool: toolName,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runServer(garminClient: GarminConnectClient): Promise<void> {
  logger.info('Starting Garmin MCP Server...');

  try {
    const server = await createMCPServer(garminClient);
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Garmin MCP Server running!');
    logger.info('Connected to Garmin Connect');
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error('Failed to start server: ' + error);
    throw err;
  }
}
