/**
 * Horizon Docker Agent Client Bridge
 * Connects to local Docker agent on http://127.0.0.1:5174 when explicitly enabled.
 * Defaults to high-fidelity In-Memory Simulator with zero network noise or ERR_CONNECTION_REFUSED spam.
 */

export interface DockerBridgeStatus {
  connected: boolean;
  dockerAvailable: boolean;
  agentVersion?: string;
  containers: { name: string; status: 'running' | 'stopped' | 'degraded'; port: number }[];
  mode: 'LIVE_DOCKER_AGENT' | 'IN_MEMORY_SIMULATOR';
}

class DockerBridgeService {
  private agentUrl = 'http://127.0.0.1:5174';
  private status: DockerBridgeStatus = {
    connected: false,
    dockerAvailable: false,
    containers: [],
    mode: 'IN_MEMORY_SIMULATOR',
  };
  private listeners: Set<() => void> = new Set();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Only probe if user explicitly enabled local Docker Agent in localStorage.
    // Prevents noisy ERR_CONNECTION_REFUSED console spam in default browser sessions.
    if (typeof window !== 'undefined' && localStorage.getItem('horizon_enable_docker_bridge') === 'true') {
      this.probeAgent();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public isEnabled(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem('horizon_enable_docker_bridge') === 'true';
  }

  public setEnabled(enable: boolean): void {
    if (typeof window === 'undefined') return;
    if (enable) {
      localStorage.setItem('horizon_enable_docker_bridge', 'true');
      this.probeAgent();
    } else {
      localStorage.removeItem('horizon_enable_docker_bridge');
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      this.status = {
        connected: false,
        dockerAvailable: false,
        containers: [],
        mode: 'IN_MEMORY_SIMULATOR',
      };
      this.notify();
    }
  }

  public async probeAgent(): Promise<DockerBridgeStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.agentUrl}/health`, {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = (await res.json()) as {
          status: string;
          agent: string;
          dockerAvailable: boolean;
          monitoredContainers: { name: string; status: 'running' | 'stopped'; port: number }[];
        };

        this.status = {
          connected: true,
          dockerAvailable: data.dockerAvailable,
          agentVersion: data.agent,
          containers: data.monitoredContainers,
          mode: 'LIVE_DOCKER_AGENT',
        };
        this.notify();

        // While connected, poll gently every 10s
        if (!this.pollTimer) {
          this.pollTimer = setInterval(() => this.probeAgent(), 10000);
        }
        return this.status;
      }
    } catch {
      // Offline fallback
    }

    // If agent is offline, stop any recurring interval immediately to prevent console spam
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.status = {
      connected: false,
      dockerAvailable: false,
      containers: [],
      mode: 'IN_MEMORY_SIMULATOR',
    };
    this.notify();
    return this.status;
  }

  public getStatus(): DockerBridgeStatus {
    return this.status;
  }

  public async stopContainer(containerName: string): Promise<boolean> {
    if (!this.status.connected) return false;
    try {
      const res = await fetch(`${this.agentUrl}/chaos/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container: containerName }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async startContainer(containerName: string): Promise<boolean> {
    if (!this.status.connected) return false;
    try {
      const res = await fetch(`${this.agentUrl}/chaos/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container: containerName }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const dockerBridge = new DockerBridgeService();
