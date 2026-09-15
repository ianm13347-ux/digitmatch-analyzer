import { TickData, DerivTick } from '../types';
import { extractLastDigit } from '../utils/digitExtraction';

/**
 * DerivWebSocket Service
 * Manages WebSocket connection to Deriv public API
 */

type TickCallback = (tick: TickData) => void;
type ConnectionCallback = (connected: boolean, error?: string) => void;

class DerivWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private symbol: string | null = null;
  private tickCallbacks: Set<TickCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;
  private messageId = 1;

  constructor(url: string = 'wss://ws.binaryws.com/websockets/v3') {
    this.url = url;
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionCallbacks(false, 'Connection error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect();
        } else {
          this.notifyConnectionCallbacks(false);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.notifyConnectionCallbacks(false, 'Failed to create connection');
      this.attemptReconnect();
    }
  }

  /**
   * Subscribe to a market symbol
   */
  subscribe(symbol: string): void {
    // Prevent duplicate subscriptions
    if (this.symbol === symbol) {
      console.log(`Already subscribed to ${symbol}`);
      return;
    }

    // Unsubscribe from previous symbol
    if (this.symbol) {
      this.unsubscribe();
    }

    this.symbol = symbol;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, connecting...');
      this.connect();
      // Will subscribe after connection
      const checkConnection = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          this.sendSubscription(symbol);
        }
      }, 100);
      return;
    }

    this.sendSubscription(symbol);
  }

  /**
   * Send subscription message
   */
  private sendSubscription(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      ticks: symbol,
      subscribe: 1
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log(`Subscribed to ${symbol}`);
    } catch (error) {
      console.error('Failed to send subscription:', error);
    }
  }

  /**
   * Unsubscribe from current symbol
   */
  unsubscribe(): void {
    if (!this.symbol) return;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        forget: this.symbol
      };

      try {
        this.ws.send(JSON.stringify(message));
        console.log(`Unsubscribed from ${this.symbol}`);
      } catch (error) {
        console.error('Failed to send unsubscribe:', error);
      }
    }

    this.symbol = null;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    // Handle tick data
    if (data.tick) {
      this.handleTick(data.tick);
    }

    // Handle subscription confirmation
    if (data.subscribe) {
      console.log('Subscription confirmed:', data.subscribe);
    }

    // Handle errors
    if (data.error) {
      console.error('WebSocket error:', data.error);
      this.notifyConnectionCallbacks(false, data.error.message);
    }
  }

  /**
   * Process tick data
   */
  private handleTick(tick: DerivTick['tick']): void {
    try {
      const lastDigit = extractLastDigit(tick.quote);

      const tickData: TickData = {
        id: `${tick.symbol}-${tick.epoch}-${Math.random()}`,
        symbol: tick.symbol,
        quote: tick.quote.toString(),
        timestamp: new Date(tick.epoch * 1000).toISOString(),
        epoch: tick.epoch,
        lastDigit
      };

      this.notifyTickCallbacks(tickData);
    } catch (error) {
      console.error('Failed to process tick:', error);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.notifyConnectionCallbacks(false, 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      this.connect();
      if (this.symbol) {
        this.subscribe(this.symbol);
      }
    }, this.reconnectDelay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.unsubscribe();
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Register a callback for tick data
   */
  onTick(callback: TickCallback): () => void {
    this.tickCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.tickCallbacks.delete(callback);
    };
  }

  /**
   * Register a callback for connection status
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * Notify all tick callbacks
   */
  private notifyTickCallbacks(tick: TickData): void {
    this.tickCallbacks.forEach(callback => {
      try {
        callback(tick);
      } catch (error) {
        console.error('Error in tick callback:', error);
      }
    });
  }

  /**
   * Notify all connection callbacks
   */
  private notifyConnectionCallbacks(connected: boolean, error?: string): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected, error);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current symbol
   */
  getCurrentSymbol(): string | null {
    return this.symbol;
  }
}

// Singleton instance
let instance: DerivWebSocketService | null = null;

/**
 * Get or create DerivWebSocket service instance
 */
export function getDerivWebSocket(): DerivWebSocketService {
  if (!instance) {
    const url = import.meta.env.VITE_DERIV_WS_URL || 'wss://ws.binaryws.com/websockets/v3';
    instance = new DerivWebSocketService(url);
  }
  return instance;
}

export default DerivWebSocketService;
