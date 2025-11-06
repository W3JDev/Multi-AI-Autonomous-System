import { healthCheck } from './health-check';

export interface AutoRecoveryConfig {
  checkInterval?: number; // milliseconds
  enabled?: boolean;
  notifySlack?: (message: string) => Promise<void>;
}

/**
 * Auto-recovery system that monitors health and takes corrective actions
 */
export class AutoRecovery {
  private checkInterval: number;
  private enabled: boolean;
  private notifySlack?: (message: string) => Promise<void>;
  private intervalId?: NodeJS.Timeout;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  constructor(config: AutoRecoveryConfig = {}) {
    this.checkInterval = config.checkInterval || 30000; // 30 seconds default
    this.enabled = config.enabled ?? true;
    this.notifySlack = config.notifySlack;
  }

  /**
   * Start auto-recovery monitoring
   */
  start() {
    if (!this.enabled) {
      console.log('Auto-recovery is disabled');
      return;
    }

    console.log(`Starting auto-recovery system (check interval: ${this.checkInterval}ms)`);
    
    this.intervalId = setInterval(async () => {
      await this.performHealthCheck();
    }, this.checkInterval);
  }

  /**
   * Stop auto-recovery monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Auto-recovery system stopped');
    }
  }

  /**
   * Perform health check and recovery actions
   */
  private async performHealthCheck() {
    try {
      const health = await healthCheck();

      if (health.status === 'healthy') {
        // Reset failure counter on success
        if (this.consecutiveFailures > 0) {
          console.log('System recovered');
          await this.notify('✅ System health restored');
          this.consecutiveFailures = 0;
        }
        return;
      }

      // System is degraded or unhealthy
      this.consecutiveFailures++;
      console.warn(`Health check failed (${this.consecutiveFailures}/${this.MAX_CONSECUTIVE_FAILURES})`, health);

      // Attempt recovery actions
      await this.attemptRecovery(health);

      // Alert if failures persist
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        await this.notify(`🚨 CRITICAL: System unhealthy after ${this.consecutiveFailures} checks`);
      }
    } catch (error) {
      console.error('Auto-recovery check failed:', error);
    }
  }

  /**
   * Attempt to recover from failures
   */
  private async attemptRecovery(health: Awaited<ReturnType<typeof healthCheck>>) {
    const { checks } = health;

    // Database recovery
    if (checks.database.status === 'error') {
      console.log('Attempting database reconnection...');
      try {
        const { db } = await import('@repo/database');
        await db.$connect();
        console.log('✅ Database reconnected');
        await this.notify('✅ Database reconnected successfully');
      } catch (error) {
        console.error('❌ Database reconnection failed:', error);
      }
    }

    // Gemini API fallback to DeepSeek
    if (checks.gemini?.status === 'error' && checks.deepseek?.status === 'ok') {
      console.log('Gemini API unavailable, failover to DeepSeek is available');
      await this.notify('⚠️ Gemini API unavailable, using DeepSeek fallback');
    }

    // Supabase check
    if (checks.supabase?.status === 'error') {
      console.log('⚠️ Supabase connectivity issue detected');
      await this.notify('⚠️ Supabase connectivity issue detected');
    }
  }

  /**
   * Send notification (Slack or console)
   */
  private async notify(message: string) {
    console.log(`[Auto-Recovery] ${message}`);
    
    if (this.notifySlack) {
      try {
        await this.notifySlack(message);
      } catch (error) {
        console.error('Failed to send Slack notification:', error);
      }
    }
  }
}

/**
 * Send Slack notification (helper function)
 */
export async function sendSlackNotification(webhookUrl: string, message: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        username: 'W3JDev Auto-Recovery',
        icon_emoji: ':robot_face:',
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}
