class DialysisWebSocket {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.listeners = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.statusListeners = new Set();
  }

  connect(sessionId = 1) {
    this.sessionId = sessionId;
    if (this.socket) {
      this.socket.close();
    }

    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:8000/ws/monitor/${sessionId}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
        console.log(`[WebSocket] Connected to session ${sessionId}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (e) {
          console.warn('[WebSocket] Parse error:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        console.log('[WebSocket] Connection closed. Retrying in 3s...');
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket] Error:', err);
        this.isConnected = false;
        this.notifyStatus(false);
      };
    } catch (err) {
      console.error('[WebSocket] Setup exception:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.sessionId) {
        this.connect(this.sessionId);
      }
    }, 3000);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => this.statusListeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Error in WS subscriber:', e);
      }
    });
  }

  notifyStatus(status) {
    this.statusListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {
        console.error('Error in WS status subscriber:', e);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyStatus(false);
  }
}

export const wsService = new DialysisWebSocket();
export default wsService;
