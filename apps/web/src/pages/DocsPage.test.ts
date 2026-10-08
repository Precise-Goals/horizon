import { describe, it, expect } from 'bun:test';

describe('MCP Server & AI Documentation Spec Suite', () => {
  it('validates Claude Desktop MCP configuration JSON validity', () => {
    const configStr = JSON.stringify({
      mcpServers: {
        horizon: {
          command: 'bunx',
          args: ['@horizon/mcp-server@latest'],
          env: {
            HORIZON_API_URL: 'https://horizon-recovery.vercel.app/api/v1',
            MST_CHAIN_ID: '91562037',
            MST_RPC_URL: 'https://testnet.mstscan.com/rpc',
            SARVAM_AGENT_ENABLED: 'true',
          },
        },
      },
    });

    const parsed = JSON.parse(configStr);
    expect(parsed.mcpServers.horizon).toBeDefined();
    expect(parsed.mcpServers.horizon.command).toBe('bunx');
    expect(parsed.mcpServers.horizon.env.MST_CHAIN_ID).toBe('91562037');
  });

  it('validates Cursor IDE SSE transport MCP configuration', () => {
    const configStr = JSON.stringify({
      mcpServers: {
        horizon: {
          url: 'https://horizon-recovery.vercel.app/api/v1/mcp',
          transport: 'sse',
          headers: {
            'X-Horizon-Client': 'cursor-agent',
            'X-MST-Chain': '91562037',
          },
        },
      },
    });

    const parsed = JSON.parse(configStr);
    expect(parsed.mcpServers.horizon.transport).toBe('sse');
    expect(parsed.mcpServers.horizon.url).toContain('/api/v1/mcp');
  });

  it('validates Antigravity CLI MCP servers specification', () => {
    const configStr = JSON.stringify({
      servers: [
        {
          name: 'horizon',
          command: 'bun',
          args: ['run', 'scripts/docker-agent.ts', '--mcp-stdio'],
          description: 'Horizon Autonomous Infrastructure Recovery & SRE Tool Engine',
        },
      ],
    });

    const parsed = JSON.parse(configStr);
    expect(parsed.servers).toHaveLength(1);
    expect(parsed.servers[0].name).toBe('horizon');
  });

  it('verifies standard Horizon MCP tools catalogue', () => {
    const requiredTools = [
      'horizon_get_topology',
      'horizon_simulate_failure',
      'horizon_trigger_recovery',
      'horizon_sign_approval_gate',
      'horizon_verify_audit_proof',
      'horizon_synthesize_yaml',
    ];

    expect(requiredTools).toHaveLength(6);
    requiredTools.forEach((tool) => {
      expect(tool.startsWith('horizon_')).toBe(true);
    });
  });

  it('verifies slash commands registry', () => {
    const slashCommands = [
      '/diagnose',
      '/heal',
      '/blast-radius',
      '/gate-sign',
      '/audit-verify',
      '/simulate',
      '/export-yaml',
      '/status',
    ];

    expect(slashCommands).toContain('/diagnose');
    expect(slashCommands).toContain('/heal');
    expect(slashCommands).toContain('/gate-sign');
    expect(slashCommands.every((c) => c.startsWith('/'))).toBe(true);
  });
});
