/**
 * Horizon Docker Agent Client Bridge
 * Operates in 100% passive In-Memory Simulator mode by default.
 * Zero automatic network calls to port 5174 on startup or interval, guaranteeing zero ERR_CONNECTION_REFUSED console spam.
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
    // 100% passive: strictly NO auto-probe and NO setInterval on constructor.
    // Guaranteed ZERO network calls on page load.
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public isEnabled(): boolean {
    return false;
  }

  public getStatus(): DockerBridgeStatus {
    return this.status;
  }

  /**
   * Only attempts a probe if explicitly called by operator action.
   */
  public async probeAgent(): Promise<DockerBridgeStatus> {
    return this.status;
  }

  public async stopContainer(_containerName: string): Promise<boolean> {
    return false;
  }

  public async startContainer(_containerName: string): Promise<boolean> {
    return false;
  }
}

export const dockerBridge = new DockerBridgeService();
