// Simple pub/sub event bus for cross-component communication
type Callback = (...args: any[]) => void;

interface EventMap {
  [key: string]: Callback[];
}

class EventBus {
  private events: EventMap = {};

  // Subscribe to an event
  on(event: string, callback: Callback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event with data
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(...args);
      });
    }
  }
}

// Create a singleton instance
const eventBus = new EventBus();
export default eventBus; 