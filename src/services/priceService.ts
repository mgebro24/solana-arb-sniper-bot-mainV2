
import externalApiConfig from "@/config/externalApis";

export interface TokenPrice {
  [dex: string]: number;
}

export interface PriceData {
  [token: string]: TokenPrice;
}

export interface ArbitrageStep {
  dex: string;
  fromToken: string;
  toToken: string;
}

export interface ArbitrageOpportunity {
  id: string;
  route: string;
  strategyType: 'direct' | 'triangular' | 'quadrilateral';
  path: ArbitrageStep[];
  profitUsd: number;
  profitPct: number;
  status: 'ready' | 'executing' | 'completed' | 'failed' | 'analyzing';
  timestamp?: number;
  executionTime?: number;
  gasCost?: number;
  investmentAmount?: number;
  riskFactor?: number; // 0 to 1, higher is riskier
  expectedSuccessRate?: number; // 0 to 1
  failureReason?: string;
}

export interface TransactionResult {
  success: boolean;
  profitAfterCosts: number;
  executionTime: number;
  gasCost: number;
  failureReason?: string;
}

// Mock price data for development
const mockPriceData: PriceData = {
  "SOL": {
    "Raydium": 144.55,
    "Jupiter": 144.95,
    "Orca": 144.25,
    "Meteora": 145.10
  },
  "BONK": {
    "Raydium": 0.000027,
    "Jupiter": 0.0000272,
    "Orca": 0.0000276,
    "Meteora": 0.0000274
  },
  "USDC": {
    "Raydium": 1.00,
    "Jupiter": 1.00,
    "Orca": 1.00,
    "Meteora": 1.00
  },
  "mSOL": {
    "Raydium": 147.20,
    "Jupiter": 146.90,
    "Orca": 147.05,
    "Meteora": 147.40
  },
  "JUP": {
    "Raydium": 1.26,
    "Jupiter": 1.27,
    "Orca": 1.25,
    "Meteora": 1.28
  }
};

/**
 * Fetch token prices from various DEXes
 * In production, this would connect to real APIs
 */
export const fetchTokenPrices = async (): Promise<PriceData> => {
  try {
    // In a real implementation, this would make API calls to various DEXes
    // For now, we'll use simulated data with slight randomization
    
    // Check if we're in a production environment with API configs
    if (process.env.NODE_ENV === 'production') {
      const priceData: PriceData = {};
      
      try {
        // Jupiter API endpoint for price data
        const jupiterResponse = await fetch(`${externalApiConfig.jupiter.baseUrl}/price`);
        if (jupiterResponse.ok) {
          const jupiterData = await jupiterResponse.json();
          // Process Jupiter data
          // Implementation would depend on the API response format
        }
        
        // Add other DEX API calls as needed
        
      } catch (apiError) {
        console.error("API error in fetchTokenPrices:", apiError);
        // Fallback to mock data if API calls fail
        return generateRandomizedPriceData();
      }
      
      return priceData;
    } else {
      // In development, use randomized mock data
      return generateRandomizedPriceData();
    }
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
};

/**
 * Generate randomized price data based on mock data
 * This simulates price fluctuations in different DEXes
 */
const generateRandomizedPriceData = (): PriceData => {
  const randomizedData: PriceData = {};
  
  // For each token in our mock data
  Object.entries(mockPriceData).forEach(([token, dexes]) => {
    randomizedData[token] = {};
    
    // For each DEX
    Object.entries(dexes).forEach(([dex, price]) => {
      // Add random fluctuation (-0.5% to +0.5%)
      const fluctuation = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
      const newPrice = price * (1 + fluctuation);
      
      // Round to appropriate decimals based on price magnitude
      const roundedPrice = price < 0.001 
        ? parseFloat(newPrice.toFixed(8)) 
        : price < 0.1 
          ? parseFloat(newPrice.toFixed(6))
          : parseFloat(newPrice.toFixed(4));
          
      randomizedData[token][dex] = roundedPrice;
    });
  });
  
  return randomizedData;
};

/**
 * Find arbitrage opportunities based on price data and strategy preferences
 */
export const findArbitrageOpportunities = async (
  priceData: PriceData, 
  strategies: { direct: boolean; triangular: boolean; quadrilateral: boolean }
): Promise<ArbitrageOpportunity[]> => {
  const opportunities: ArbitrageOpportunity[] = [];
  
  // Direct arbitrage (same token, different DEXes)
  if (strategies.direct) {
    opportunities.push(...findDirectArbitrageOpportunities(priceData));
  }
  
  // Triangular arbitrage (three tokens in a cycle)
  if (strategies.triangular) {
    opportunities.push(...findTriangularArbitrageOpportunities(priceData));
  }
  
  // Quadrilateral arbitrage (four tokens in a cycle)
  if (strategies.quadrilateral) {
    opportunities.push(...findQuadrilateralArbitrageOpportunities(priceData));
  }
  
  return opportunities;
};

/**
 * Find direct arbitrage opportunities (same token, different DEXes)
 */
const findDirectArbitrageOpportunities = (priceData: PriceData): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  
  // For each token
  Object.entries(priceData).forEach(([token, dexes]) => {
    // Skip stablecoins for direct arbitrage (unlikely to have significant price differences)
    if (token === 'USDC') return;
    
    // Find lowest sell price and highest buy price
    const dexEntries = Object.entries(dexes);
    
    for (let i = 0; i < dexEntries.length; i++) {
      const [sellDex, sellPrice] = dexEntries[i];
      
      for (let j = 0; j < dexEntries.length; j++) {
        if (i === j) continue; // Skip same DEX
        
        const [buyDex, buyPrice] = dexEntries[j];
        
        // Check if there's a profitable opportunity (buy low, sell high)
        if (sellPrice < buyPrice) {
          const profitPct = ((buyPrice / sellPrice) - 1) * 100;
          
          // Filter out noise - only include opportunities with significant profit
          if (profitPct > 0.25) {
            // Calculate estimated profit in USD for 100 units
            const investmentAmount = 100; // Assuming 100 units of base currency
            const profitUsd = (investmentAmount / sellPrice) * (buyPrice - sellPrice);
            
            // Calculate gas cost and risk factors
            const estimatedGasCost = 0.015; // SOL
            const gasCostUsd = estimatedGasCost * priceData['SOL']['Raydium']; // Use Raydium's SOL price as reference
            
            // Only include if profit exceeds gas cost
            if (profitUsd > gasCostUsd * 1.2) { // 20% buffer for profitability
              opportunities.push({
                id: `direct-${token}-${sellDex}-${buyDex}-${Date.now()}`,
                route: `${token} (${sellDex} → ${buyDex})`,
                strategyType: 'direct',
                path: [
                  { dex: sellDex, fromToken: 'USDC', toToken: token },
                  { dex: buyDex, fromToken: token, toToken: 'USDC' }
                ],
                profitUsd,
                profitPct,
                status: 'ready',
                gasCost: gasCostUsd,
                riskFactor: 0.1, // Direct arbitrage is low risk
                timestamp: Date.now()
              });
            }
          }
        }
      }
    }
  });
  
  return opportunities;
};

/**
 * Find triangular arbitrage opportunities (three tokens in a cycle)
 */
const findTriangularArbitrageOpportunities = (priceData: PriceData): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  const tokens = Object.keys(priceData);
  
  // For each starting token (we'll use USDC as base)
  const baseToken = 'USDC';
  
  // Generate a few sample triangular arbitrage routes
  // In a real implementation, this would systematically check all possible routes
  const midTokens = tokens.filter(t => t !== baseToken);
  
  midTokens.forEach(midToken => {
    const dexes = Object.keys(priceData[midToken]);
    
    for (let i = 0; i < dexes.length; i++) {
      const firstDex = dexes[i];
      
      // For each second intermediate token
      tokens.filter(t => t !== baseToken && t !== midToken).forEach(secondMidToken => {
        for (let j = 0; j < dexes.length; j++) {
          if (!priceData[secondMidToken][dexes[j]]) continue;
          
          const secondDex = dexes[j];
          
          for (let k = 0; k < dexes.length; k++) {
            if (!priceData[secondMidToken][dexes[k]]) continue;
            
            const thirdDex = dexes[k];
            
            // Calculate potential profit
            // This is a simplified calculation - in reality would need to account for:
            // - Actual order book depth
            // - Trading fees
            // - Slippage
            
            // Simulate a 100 USDC investment
            let amount = 100; // USDC
            
            // Step 1: USDC -> first mid token
            const rate1 = 1 / priceData[midToken][firstDex]; // How much midToken per USDC
            amount = amount * rate1; // Now in midToken
            
            // Step 2: first mid token -> second mid token
            const rate2 = priceData[midToken][secondDex] / priceData[secondMidToken][secondDex]; // midToken to secondMidToken
            amount = amount * rate2; // Now in secondMidToken
            
            // Step 3: second mid token -> back to USDC
            const rate3 = priceData[secondMidToken][thirdDex]; // secondMidToken to USDC
            amount = amount * rate3; // Now back in USDC
            
            const profit = amount - 100; // Profit in USDC
            const profitPct = (profit / 100) * 100; // Profit as percentage
            
            // Add if profitable (accounting for gas and risk)
            if (profitPct > 0.4) { // Higher threshold for triangular due to complexity
              // Calculate gas cost and risk factors
              const estimatedGasCost = 0.025; // SOL - higher for triangular
              const gasCostUsd = estimatedGasCost * priceData['SOL']['Raydium']; // Use Raydium's SOL price as reference
              
              // Only include if profit exceeds gas cost
              if (profit > gasCostUsd * 1.3) { // 30% buffer for triangular
                const riskFactor = 0.3 + (Math.random() * 0.2); // Medium risk, slightly randomized
                
                opportunities.push({
                  id: `triangular-${baseToken}-${midToken}-${secondMidToken}-${Date.now()}`,
                  route: `${baseToken} → ${midToken} → ${secondMidToken} → ${baseToken}`,
                  strategyType: 'triangular',
                  path: [
                    { dex: firstDex, fromToken: baseToken, toToken: midToken },
                    { dex: secondDex, fromToken: midToken, toToken: secondMidToken },
                    { dex: thirdDex, fromToken: secondMidToken, toToken: baseToken }
                  ],
                  profitUsd: profit,
                  profitPct,
                  status: 'ready',
                  gasCost: gasCostUsd,
                  riskFactor,
                  timestamp: Date.now()
                });
              }
            }
          }
        }
      });
    }
  });
  
  return opportunities;
};

/**
 * Find quadrilateral arbitrage opportunities (four tokens in a cycle)
 */
const findQuadrilateralArbitrageOpportunities = (priceData: PriceData): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  
  // Generate a few sample quadrilateral arbitrage opportunities
  // These are more complex and would require more sophisticated algorithms in a real implementation
  
  // For demonstration purposes, generate a few simulated opportunities
  const baseToken = 'USDC';
  const possibleTokens = Object.keys(priceData).filter(t => t !== baseToken);
  const dexes = ['Raydium', 'Jupiter', 'Orca', 'Meteora'];
  
  // Generate 2-3 quadrilateral opportunities
  for (let i = 0; i < 3; i++) {
    // Randomly select 3 tokens for the path (plus base token)
    const shuffled = [...possibleTokens].sort(() => 0.5 - Math.random());
    const tokens = shuffled.slice(0, 3);
    
    // Generate random profit (higher for more complex paths)
    const profit = 0.8 + Math.random() * 1.5; // $0.80 - $2.30
    const profitPct = 0.8 + Math.random() * 1.0; // 0.8% - 1.8%
    
    // Calculate gas cost and risk factors
    const estimatedGasCost = 0.035; // SOL - higher for quadrilateral
    const gasCostUsd = estimatedGasCost * priceData['SOL']['Raydium']; // Use Raydium's SOL price as reference
    
    // Higher risk for more complex strategies
    const riskFactor = 0.5 + (Math.random() * 0.3); // 0.5 - 0.8 risk factor
    
    // Randomly select DEXes for each step
    const selectedDexes = Array.from(
      { length: 4 }, 
      () => dexes[Math.floor(Math.random() * dexes.length)]
    );
    
    opportunities.push({
      id: `quad-${tokens.join('-')}-${Date.now()}`,
      route: `${baseToken} → ${tokens[0]} → ${tokens[1]} → ${tokens[2]} → ${baseToken}`,
      strategyType: 'quadrilateral',
      path: [
        { dex: selectedDexes[0], fromToken: baseToken, toToken: tokens[0] },
        { dex: selectedDexes[1], fromToken: tokens[0], toToken: tokens[1] },
        { dex: selectedDexes[2], fromToken: tokens[1], toToken: tokens[2] },
        { dex: selectedDexes[3], fromToken: tokens[2], toToken: baseToken }
      ],
      profitUsd: profit,
      profitPct,
      status: 'ready',
      gasCost: gasCostUsd,
      riskFactor,
      timestamp: Date.now()
    });
  }
  
  return opportunities;
};

/**
 * Simulate the execution of an arbitrage transaction
 * In a production environment, this would be an actual transaction on Solana
 */
export const simulateTransaction = async (
  opportunity: ArbitrageOpportunity, 
  investmentAmount: number
): Promise<TransactionResult> => {
  // Simulate network latency and transaction time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
  
  // Calculate the scale of the opportunity based on investment amount
  const scaleFactor = investmentAmount / 100; // Original calc was based on $100
  const expectedProfit = opportunity.profitUsd * scaleFactor;
  const gasCost = (opportunity.gasCost || 0.02) * (0.9 + Math.random() * 0.2); // Slight randomization
  
  // Simulate success probability based on risk factor and complexity
  const baseSuccessProb = opportunity.riskFactor 
    ? 1 - opportunity.riskFactor // Inverse of risk factor
    : opportunity.strategyType === 'direct' ? 0.95 
      : opportunity.strategyType === 'triangular' ? 0.85 
      : 0.75; // Default for quadrilateral
  
  // Adjust for investment size - larger investments may have higher slippage
  const sizeAdjustment = investmentAmount > 50 ? -0.05 : 0;
  
  // Random element to simulate market conditions
  const randomFactor = Math.random() * 0.1;
  
  // Calculate final success probability
  const successProbability = Math.min(1, Math.max(0, baseSuccessProb + sizeAdjustment + randomFactor));
  
  // Determine if transaction succeeds
  const success = Math.random() < successProbability;
  
  // Calculate execution time and profit after costs
  const executionTime = 200 + Math.floor(Math.random() * 400); // 200-600ms
  const actualProfit = success 
    ? expectedProfit * (0.85 + Math.random() * 0.3) // 85% - 115% of expected profit
    : 0;
  const profitAfterCosts = actualProfit - (gasCost * priceData['SOL']['Raydium']); // Convert SOL gas to USD
  
  // Generate a realistic failure reason if needed
  let failureReason: string | undefined;
  if (!success) {
    const failureReasons = [
      "Price moved before execution completed",
      "Insufficient liquidity in target pool",
      "Order execution exceeded slippage tolerance",
      "Network congestion caused transaction timeout",
      "Rate limiting on DEX API",
      "Temporary pool imbalance"
    ];
    failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
  }
  
  return {
    success,
    profitAfterCosts,
    executionTime,
    gasCost,
    failureReason
  };
};
