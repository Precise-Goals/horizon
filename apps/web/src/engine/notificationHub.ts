/**
 * Horizon Incident Notification Hub & War Room Dispatcher
 * Bridges autonomous recovery events with team coordination channels:
 * - Real outbound Webhook dispatches (Slack, Discord, Custom HTTP)
 * - In-App multi-channel SRE War Room feed (#sre-bridge, #database-ops, #secops-governance)
 */

export interface WarRoomMessage {
  id: string;
  channel: '#sre-bridge' | '#database-ops' | '#secops-governance';
  sender: string;
  timestamp: string;
  badge?: string;
  text: string;
  payload?: Record<string, unknown>;
}

export interface IncidentAlertPayload {
  id: string;
  nodeId: string;
  nodeName: string;
  type: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

class NotificationHubService {
  private webhookUrl: string = '';
  private messages: WarRoomMessage[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seedInitialMessages();
  }

  private seedInitialMessages(): void {
    const now = Date.now();
    this.messages = [
      {
        id: 'msg-1',
        channel: '#sre-bridge',
        sender: 'Horizon Sentinel Bot',
        timestamp: new Date(now - 1200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: 'HEARTBEAT',
        text: 'All 7 cluster nodes reporting nominal telemetry. Continuous watchdog probe active (4s interval).',
      },
      {
        id: 'msg-2',
        channel: '#secops-governance',
        sender: 'BridgeKey Sentry',
        timestamp: new Date(now - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: 'MST TESTNET',
        text: 'MST Testnet Validator online (Chain ID 91562037). EIP-712 multi-signature gate primed for High-Risk mutations.',
      },
    ];
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public setWebhookUrl(url: string): void {
    this.webhookUrl = url.trim();
  }

  public getWebhookUrl(): string {
    return this.webhookUrl;
  }

  public getMessages(channel?: string): WarRoomMessage[] {
    if (!channel) return [...this.messages];
    return this.messages.filter((m) => m.channel === channel);
  }

  /**
   * Broadcasts an autonomous failure incident to the war room and outbound webhooks.
   */
  public async broadcastIncident(incident: IncidentAlertPayload): Promise<void> {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Post to #sre-bridge
    this.messages.unshift({
      id: `wrm-${Date.now()}-1`,
      channel: '#sre-bridge',
      sender: 'Horizon Failure Detector',
      timestamp: time,
      badge: incident.severity.toUpperCase(),
      text: `🚨 INCIDENT DETECTED on ${incident.nodeName} (${incident.nodeId}). Autonomous DAG orchestrator triggered bottom-up self-healing plan.`,
    });

    // 2. Post to specialized channel
    if (incident.type === 'database') {
      this.messages.unshift({
        id: `wrm-${Date.now()}-2`,
        channel: '#database-ops',
        sender: 'DB Cluster Watchdog',
        timestamp: time,
        badge: 'FAILOVER REQUIRED',
        text: `Primary database connection pool depleted on ${incident.nodeName}. Gated by BridgeKey EIP-712 before promoting standby replica.`,
      });

      this.messages.unshift({
        id: `wrm-${Date.now()}-3`,
        channel: '#secops-governance',
        sender: 'Governance Sentry',
        timestamp: time,
        badge: 'APPROVAL GATE',
        text: `Awaiting cryptographic EIP-712 signature from authorized Commander wallet on MST Testnet (91562037).`,
      });
    }

    if (this.messages.length > 100) this.messages.pop();
    this.notify();

    // 3. Dispatch outbound webhook if configured
    if (this.webhookUrl) {
      this.dispatchWebhook({
        content: `🚨 **Horizon Incident Declared: ${incident.nodeName}** (${incident.severity.toUpperCase()})\n- Service: \`${incident.nodeId}\`\n- Timestamp: \`${incident.timestamp}\`\n- Recovery: Topological DAG self-healing activated.`,
      });
    }
  }

  /**
   * Dispatches outbound HTTP POST webhook to Slack, Discord, or generic endpoint.
   */
  public async dispatchWebhook(payload: Record<string, unknown>): Promise<boolean> {
    if (!this.webhookUrl) return false;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
      return true;
    } catch (err) {
      console.warn('Webhook dispatch error:', err);
      return false;
    }
  }
}

export const notificationHub = new NotificationHubService();
