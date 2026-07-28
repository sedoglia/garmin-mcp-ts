// src/utils/stdio-guard.ts
/**
 * Protects the MCP stdio channel.
 *
 * stdout must carry nothing but JSON-RPC frames: a single stray line from a
 * dependency (dotenv prints a banner there, for one) corrupts the stream. This
 * module patches console.log and process.stdout.write as a side effect and must
 * therefore be imported before every other module — ESM evaluates imports in
 * declaration order, so its position in the import list is what makes it work.
 */

// Reindirizza console.log su stderr
console.log = (...args: unknown[]) => {
  console.error('[LOG]', ...args);
};

// Rete di sicurezza per chi scrive direttamente su stdout
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
  // Se non sembra un frame JSON-RPC, finisce su stderr
  if (typeof chunk === 'string' && !chunk.trim().startsWith('{')) {
    process.stderr.write(chunk, encoding, callback);
    return true;
  }
  return originalStdoutWrite(chunk, encoding, callback);
};

export {};
