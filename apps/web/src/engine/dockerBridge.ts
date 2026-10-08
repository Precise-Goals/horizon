/**
 * Horizon Docker Agent Client Bridge
 * Pings the local Docker agent on http://127.0.0.1:5174.
 * Enables seamless Hybrid Mode: uses real local Docker containers if agent is running,
 * or gracefully falls back to the high-fidelity in-memory simulator if offline.
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

  constructor() {
    this.probeAgent();
    setInterval(() => this.probeAgent(), 6000);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public async probeAgent(): Promise<DockerBridgeStatus> {
    try {
      const res = await fetch(`${this.agentUrl}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
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
        return this.status;
      }
    } catch {
      // Offline fallback
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
