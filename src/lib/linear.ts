import { LinearClient } from '@linear/sdk';

// Create a function that returns the client lazily to avoid build-time errors
function getLinearClient(): LinearClient {
  if (!process.env.LINEAR_API_KEY) {
    throw new Error('LINEAR_API_KEY is not defined in environment variables');
  }
  return new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });
}

// Lazy initialization - only creates client when first accessed at runtime
let _linearClient: LinearClient | null = null;

export const linearClient = new Proxy({} as LinearClient, {
  get(_target, prop) {
    if (!_linearClient) {
      _linearClient = getLinearClient();
    }
    return (_linearClient as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const LINEAR_CONFIG = {
  clientLabelId: process.env.LINEAR_CLIENT_LABEL_ID || '',
  defaultTeamId: process.env.LINEAR_DEFAULT_TEAM_ID || '',
};
