
/**
 * Mock WebSocket implementation for demo purposes
 * In a production app, this would be replaced with a real WebSocket connection
 */
export class MockWebSocket {
  private callbacks: Record<string, Function[]> = {};
  private isConnected = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    console.log(`Connecting to WebSocket: ${this.url}`);
    
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.trigger('open', {});
      console.log('WebSocket connected');
    }, 500);
  }

  public send(data: any) {
    if (!this.isConnected) {
      console.warn('Cannot send message, WebSocket is not connected');
      return;
    }
    
    console.log('WebSocket message sent:', data);
    
    // For demo: echo back a response for certain message types
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'subscribe') {
          this.simulateResponse('subscription_success', { channel: parsedData.channel });
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    }
  }

  public close() {
    this.isConnected = false;
    this.trigger('close', { code: 1000, reason: 'Normal closure' });
    console.log('WebSocket disconnected');
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  private trigger(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // For demo purposes: simulate receiving a message
  public simulateMessage(message: any) {
    this.trigger('message', { data: JSON.stringify(message) });
  }

  private simulateResponse(type: string, data: any) {
    setTimeout(() => {
      this.simulateMessage({ type, data });
    }, 300);
  }

  // Simulate connection issues and reconnection
  public simulateDisconnect() {
    if (this.isConnected) {
      this.isConnected = false;
      this.trigger('close', { code: 1006, reason: 'Connection lost' });
      console.log('WebSocket connection lost, attempting to reconnect...');
      
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }
}
