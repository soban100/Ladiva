class NotificationService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private lastNotificationTime: number = 0;
  private readonly MIN_NOTIFICATION_INTERVAL = 1000; // 1 second minimum between notifications

  constructor() {
    // Check user preference from localStorage
    const savedPreference = localStorage.getItem('notification-enabled');
    if (savedPreference !== null) {
      this.enabled = savedPreference === 'true';
    }
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a notification sound using Web Audio API
   */
  private playNotificationSound(type: 'order' | 'user' | 'product' | 'category' | 'success' | 'error'): void {
    if (!this.enabled) return;

    // Prevent notification spam
    const now = Date.now();
    if (now - this.lastNotificationTime < this.MIN_NOTIFICATION_INTERVAL) {
      return;
    }
    this.lastNotificationTime = now;

    try {
      this.initAudioContext();
      
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different tones for different types of notifications
      switch (type) {
        case 'order':
          // Pleasant chime for orders
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
          oscillator.frequency.setValueAtTime(1100, this.audioContext.currentTime + 0.1); // C#6
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.3);
          break;
          
        case 'user':
          // Soft tone for new users
          oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime); // E5
          gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.2);
          break;
          
        case 'product':
          // Upward tone for products
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.15); // A5
          gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.25);
          break;
          
        case 'category':
          // Quick blip for categories
          oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
          gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.15);
          break;
          
        case 'success':
          // Success tone
          oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.4);
          break;
          
        case 'error':
          // Error tone
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.3);
          break;
          
        default:
          // Default notification
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  /**
   * Notify about a new order
   */
  notifyOrder(): void {
    this.playNotificationSound('order');
    console.log('🔔 [NOTIFICATION] New order received');
  }

  /**
   * Notify about a new user
   */
  notifyUser(): void {
    this.playNotificationSound('user');
    console.log('🔔 [NOTIFICATION] New user registered');
  }

  /**
   * Notify about a new product
   */
  notifyProduct(): void {
    this.playNotificationSound('product');
    console.log('🔔 [NOTIFICATION] New product added');
  }

  /**
   * Notify about a new category
   */
  notifyCategory(): void {
    this.playNotificationSound('category');
    console.log('🔔 [NOTIFICATION] New category created');
  }

  /**
   * Notify about a success action
   */
  notifySuccess(): void {
    this.playNotificationSound('success');
    console.log('🔔 [NOTIFICATION] Success action');
  }

  /**
   * Notify about an error
   */
  notifyError(): void {
    this.playNotificationSound('error');
    console.log('🔔 [NOTIFICATION] Error occurred');
  }

  /**
   * Enable or disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('notification-enabled', String(enabled));
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle notifications
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('notification-enabled', String(this.enabled));
    return this.enabled;
  }
}

export const notificationService = new NotificationService();
