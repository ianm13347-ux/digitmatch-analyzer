// Market and Tick Data Types
export interface TickData {
  id: string;
  symbol: string;
  quote: string;
  timestamp: string;
  epoch: number;
  lastDigit: number;
}

export interface MarketSymbol {
  name: string;
  displayName: string;
  category: 'volatility' | 'crash_boom' | 'other';
  active: boolean;
}

// Digit Statistics
export interface DigitStats {
  digit: number;
  count: number;
  frequency: number; // percentage
  lastSeenIndex: number; // ticks ago
  gap: number; // distance since last occurrence
  currentStreak: number;
  longestStreak: number;
  rank: number; // 0-9, where 0 is most frequent
}

export interface DigitDistribution {
  timestamp: string;
  stats: DigitStats[];
  totalTicks: number;
  windowSize: number;
}

// Patterns
export interface Pattern {
  type: 'repeated' | 'alternating' | 'streak' | 'cluster' | 'gap' | 'deviation';
  description: string;
  confidence: number; // 0-100
  affectedDigits: number[];
}

// Signals
export interface Signal {
  id: string;
  symbol: string;
  predictedDigit: number | null;
  confidence: number; // 0-100
  sampleSize: number;
  timestamp: string;
  epoch: number;
  status: 'PENDING' | 'WIN' | 'LOSS' | 'INVALID';
  actualDigit?: number;
  explanation: string;
  modelVersion: string;
  analysisWindow: number;
  historicalValidation: number; // 0-100
  components: SignalComponents;
}

export interface SignalComponents {
  frequencyComponent: number;
  recencyComponent: number;
  historyComponent: number;
  patternComponent: number;
  performanceComponent: number;
}

// Backtesting
export interface BacktestMetrics {
  totalSignals: number;
  successfulSignals: number;
  unsuccessfulSignals: number;
  pendingSignals: number;
  accuracy: number; // percentage
  precision: number;
  recall: number;
  winStreak: number;
  lossStreak: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  recentAccuracy10: number;
  recentAccuracy50: number;
  recentAccuracy100: number;
}

export interface BacktestResult {
  symbol: string;
  period: {
    start: string;
    end: string;
  };
  dataSet: {
    training: number;
    validation: number;
    testing: number;
  };
  metrics: BacktestMetrics;
  performanceByDigit: Record<number, {
    total: number;
    wins: number;
    accuracy: number;
  }>;
  performanceByWindow: Record<number, BacktestMetrics>;
  timestamp: string;
}

// WebSocket Events
export interface DerivTick {
  tick: {
    bid: number;
    ask: number;
    epoch: number;
    quote: number;
    symbol: string;
  };
}

export interface WebSocketMessage {
  subscribe: string;
  symbol: string;
}

// User and Authentication
export interface User {
  id: string;
  email: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  selectedMarket: string;
  analysisWindow: number;
  minimumSampleSize: number;
  signalThreshold: number; // confidence %
  hotDigitThreshold: number; // % above expected
  coldDigitThreshold: number; // % below expected
  autoRefresh: boolean;
  soundNotifications: boolean;
  theme: 'dark' | 'light';
  dataRetentionDays: number;
}

// Application State
export interface AppState {
  isConnected: boolean;
  selectedMarket: string;
  currentPrice: string;
  lastDigit: number | null;
  ticks: TickData[];
  signals: Signal[];
  digitStats: DigitStats[] | null;
  patterns: Pattern[];
  loading: boolean;
  error: string | null;
  demoMode: boolean;
}

// Analysis Configuration
export interface AnalysisConfig {
  windowSize: number; // 50, 100, 250, 500, 1000
  minimumSampleSize: number;
  hotThreshold: number; // std devs above expected
  coldThreshold: number; // std devs below expected
  confidenceThreshold: number; // minimum confidence for signal
  lookbackPeriod: number; // for pattern analysis
}

// Performance Tracking
export interface PerformanceMetrics {
  totalSignals: number;
  winRate: number;
  accuracy: number;
  lastTenWinRate: number;
  lastFiftyWinRate: number;
  lastHundredWinRate: number;
  currentWinStreak: number;
  currentLossStreak: number;
  timestamp: string;
}

// Connection Status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'demo';

export interface ConnectionState {
  status: ConnectionStatus;
  lastUpdate: string;
  reconnectAttempts: number;
  error?: string;
}
