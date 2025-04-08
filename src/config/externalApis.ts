
/**
 * External API Configuration for Production
 * 
 * This file contains configurations for connecting to external DEX APIs.
 * It is not visible in the interface but will be included in the deployment.
 * 
 * SECURITY NOTE: In a production environment, these values should be stored 
 * as environment variables and not in the codebase.
 */

export interface ExternalApiConfig {
  quickswap: {
    baseUrl: string;
    apiKey?: string;
    rateLimits: {
      requestsPerMinute: number;
      maxBatchSize: number;
    };
  };
  jupiter: {
    baseUrl: string;
    apiKey?: string;
    websocket?: string;
  };
  orca: {
    baseUrl: string;
    apiKey?: string;
  };
  raydium: {
    baseUrl: string;
    apiKey?: string;
  };
  // Add other DEXes as needed
}

// Default configuration (will be overridden in deployed environment)
const externalApiConfig: ExternalApiConfig = {
  quickswap: {
    baseUrl: "https://api.quickswap.exchange/v2",
    rateLimits: {
      requestsPerMinute: 60,
      maxBatchSize: 100,
    }
  },
  jupiter: {
    baseUrl: "https://quote-api.jup.ag/v6",
    websocket: "wss://price.jup.ag/v1/price"
  },
  orca: {
    baseUrl: "https://api.orca.so",
  },
  raydium: {
    baseUrl: "https://api.raydium.io",
  }
};

// This function can be used to update configurations at runtime
export const updateApiConfig = (dex: keyof ExternalApiConfig, config: Partial<ExternalApiConfig[keyof ExternalApiConfig]>) => {
  if (externalApiConfig[dex]) {
    externalApiConfig[dex] = {
      ...externalApiConfig[dex],
      ...config,
    };
    console.log(`Updated ${dex} API configuration`);
    return true;
  }
  return false;
};

export default externalApiConfig;
