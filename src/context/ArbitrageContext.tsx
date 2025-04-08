
import { createContext, useContext, useState, ReactNode } from 'react';

type IntelligenceLevel = 'low' | 'medium' | 'high';

interface ArbitrageContextType {
  strategies: {
    direct: boolean;
    triangular: boolean;
    quadrilateral: boolean;
  };
  setStrategies: (strategies: {
    direct: boolean;
    triangular: boolean;
    quadrilateral: boolean;
  }) => void;
  intelligenceLevel: IntelligenceLevel;
  setIntelligenceLevel: (level: IntelligenceLevel) => void;
  botLearnings: {
    successfulTrades: number;
    failedTrades: number;
    historicalProfit: number;
    knownIssues: string[];
  };
  updateBotLearnings: (update: Partial<{
    successfulTrades: number;
    failedTrades: number;
    historicalProfit: number;
    knownIssues: string[];
  }>) => void;
}

const ArbitrageContext = createContext<ArbitrageContextType | undefined>(undefined);

export const ArbitrageProvider = ({ children }: { children: ReactNode }) => {
  const [strategies, setStrategies] = useState({
    direct: true,
    triangular: true,
    quadrilateral: false,
  });
  
  const [intelligenceLevel, setIntelligenceLevel] = useState<IntelligenceLevel>('medium');
  
  const [botLearnings, setBotLearnings] = useState({
    successfulTrades: 0,
    failedTrades: 0,
    historicalProfit: 0,
    knownIssues: [] as string[],
  });
  
  const updateBotLearnings = (update: Partial<typeof botLearnings>) => {
    setBotLearnings((prev) => ({
      ...prev,
      ...update,
      knownIssues: update.knownIssues 
        ? [...new Set([...prev.knownIssues, ...update.knownIssues])] 
        : prev.knownIssues
    }));
  };

  return (
    <ArbitrageContext.Provider 
      value={{ 
        strategies, 
        setStrategies,
        intelligenceLevel,
        setIntelligenceLevel,
        botLearnings,
        updateBotLearnings
      }}
    >
      {children}
    </ArbitrageContext.Provider>
  );
};

export const useArbitrageContext = () => {
  const context = useContext(ArbitrageContext);
  if (context === undefined) {
    throw new Error('useArbitrageContext must be used within an ArbitrageProvider');
  }
  return context;
};
