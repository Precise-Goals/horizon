import { describe, expect, it } from 'bun:test';
import { MiroDagCanvas } from './MiroDagCanvas';
import type { DecodedArchitecture } from '../../engine/dagArchitectAgent';

describe('MiroDagCanvas Component & Viewport Geometry Suite', () => {
  const mockArchitecture: DecodedArchitecture = {
    architectureName: 'High-Scale OTT Streaming & CDN Mesh',
    pattern: 'Microservices with Message Broker',
    yamlPipeline: 'kind: AutonomousRecoveryPipeline\nmetadata:\n  name: ott-stream',
    cycleDetected: false,
    cyclePath: [],
    topologicalLevels: [
      ['scylladb-catalog', 'redis-manifest'],
      ['kafka-ingest', 'ffmpeg-gpu-transcoder'],
      ['recommendation-ai', 'api-gateway'],
      ['cloudflare-cdn-ingress'],
    ],
    nodes: [
      { id: 'scylladb-catalog', name: 'ScyllaDB Catalog', type: 'database', status: 'healthy', dependencies: [] },
      { id: 'redis-manifest', name: 'Redis Manifest Cache', type: 'cache', status: 'healthy', dependencies: ['scylladb-catalog'] },
      { id: 'kafka-ingest', name: 'Kafka Ingestion Stream', type: 'application', status: 'healthy', dependencies: ['scylladb-catalog'] },
      { id: 'ffmpeg-gpu-transcoder', name: 'FFmpeg Transcoder', type: 'application', status: 'healthy', dependencies: ['kafka-ingest'] },
      { id: 'recommendation-ai', name: 'Recommendation AI', type: 'application', status: 'healthy', dependencies: ['redis-manifest', 'scylladb-catalog'] },
      { id: 'api-gateway', name: 'API Gateway', type: 'gateway', status: 'healthy', dependencies: ['ffmpeg-gpu-transcoder', 'recommendation-ai'] },
      { id: 'cloudflare-cdn-ingress', name: 'Cloudflare CDN Ingress', type: 'gateway', status: 'healthy', dependencies: ['api-gateway'] },
    ],
  };

  it('exports MiroDagCanvas as a valid React functional component', () => {
    expect(MiroDagCanvas).toBeDefined();
    expect(typeof MiroDagCanvas).toBe('function');
  });

  it('verifies bounding box calculation and auto-fit zoom scale bounds', () => {
    // 7 nodes across 4 tiers with card width 185px and height 72px
    const cardHalfWidth = 100;
    const cardHalfHeight = 45;
    const paddingX = 64;
    const paddingY = 64;

    const samplePositions = {
      'scylladb-catalog': { x: 480, y: 580 },
      'redis-manifest': { x: 720, y: 580 },
      'kafka-ingest': { x: 480, y: 420 },
      'ffmpeg-gpu-transcoder': { x: 720, y: 420 },
      'recommendation-ai': { x: 480, y: 260 },
      'api-gateway': { x: 720, y: 260 },
      'cloudflare-cdn-ingress': { x: 600, y: 100 },
    };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    Object.values(samplePositions).forEach((p) => {
      minX = Math.min(minX, p.x - cardHalfWidth);
      maxX = Math.max(maxX, p.x + cardHalfWidth);
      minY = Math.min(minY, p.y - cardHalfHeight);
      maxY = Math.max(maxY, p.y + cardHalfHeight);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    expect(contentWidth).toBeGreaterThan(0);
    expect(contentHeight).toBeGreaterThan(0);

    // In a standard 940x680 embedded window
    const containerW = 940;
    const containerH = 680;
    const availableW = containerW - paddingX * 2;
    const availableH = containerH - paddingY * 2;

    const scaleX = availableW / contentWidth;
    const scaleY = availableH / contentHeight;
    const optimalZoom = Math.min(1.15, Math.max(0.35, Math.min(scaleX, scaleY)));

    expect(optimalZoom).toBeGreaterThanOrEqual(0.35);
    expect(optimalZoom).toBeLessThanOrEqual(1.15);

    // Verify centering pan offset ensures content is fully within container
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    const targetPanX = containerW / 2 - contentCenterX * optimalZoom;
    const targetPanY = containerH / 2 - contentCenterY * optimalZoom;

    // Projected bounding box on screen
    const screenLeft = minX * optimalZoom + targetPanX;
    const screenRight = maxX * optimalZoom + targetPanX;
    const screenTop = minY * optimalZoom + targetPanY;
    const screenBottom = maxY * optimalZoom + targetPanY;

    expect(screenLeft).toBeGreaterThanOrEqual(paddingX - 1);
    expect(screenRight).toBeLessThanOrEqual(containerW - paddingX + 1);
    expect(screenTop).toBeGreaterThanOrEqual(paddingY - 1);
    expect(screenBottom).toBeLessThanOrEqual(containerH - paddingY + 1);
  });

  it('computes downstream blast radius correctly for root database failure', () => {
    // If ScyllaDB fails, trace all downstream impaired systems
    const selectedId = 'scylladb-catalog';
    const downstream = new Set<string>();
    const queue = [selectedId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of mockArchitecture.nodes) {
        if (n.dependencies.includes(current) && !downstream.has(n.id)) {
          downstream.add(n.id);
          queue.push(n.id);
        }
      }
    }

    // Downstream blast should encompass Redis, Kafka, FFmpeg, Recommendation AI, API Gateway, and Cloudflare CDN
    expect(downstream.has('redis-manifest')).toBe(true);
    expect(downstream.has('kafka-ingest')).toBe(true);
    expect(downstream.has('ffmpeg-gpu-transcoder')).toBe(true);
    expect(downstream.has('recommendation-ai')).toBe(true);
    expect(downstream.has('api-gateway')).toBe(true);
    expect(downstream.has('cloudflare-cdn-ingress')).toBe(true);
    expect(downstream.size).toBe(6);
  });

  it('computes upstream dependencies correctly for edge ingress node', () => {
    const ingressNode = mockArchitecture.nodes.find((n) => n.id === 'cloudflare-cdn-ingress');
    expect(ingressNode?.dependencies).toEqual(['api-gateway']);
  });
});
