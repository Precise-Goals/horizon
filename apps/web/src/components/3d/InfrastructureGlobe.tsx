import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export interface GlobeHub {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: 'healthy' | 'critical' | 'recovering';
  isTarget?: boolean;
}

export const GLOBAL_HUBS: GlobeHub[] = [
  { id: 'fra-01', name: 'Frankfurt Core (fra-01)', region: 'Europe Central (8.68°E, 50.11°N)', lat: 50.1109, lng: 8.6821, status: 'healthy', isTarget: true },
  { id: 'lon-01', name: 'London Edge (lon-01)', region: 'Europe West (-0.12°E, 51.50°N)', lat: 51.5074, lng: -0.1278, status: 'healthy' },
  { id: 'iad-01', name: 'Ashburn Primary (iad-01)', region: 'US East (-77.48°E, 39.04°N)', lat: 39.0438, lng: -77.4874, status: 'healthy' },
  { id: 'sfo-01', name: 'Silicon Valley (sfo-01)', region: 'US West (-122.41°E, 37.77°N)', lat: 37.7749, lng: -122.4194, status: 'healthy' },
  { id: 'hnd-01', name: 'Tokyo Node (hnd-01)', region: 'Asia Pacific (139.65°E, 35.67°N)', lat: 35.6762, lng: 139.6503, status: 'healthy' },
  { id: 'sin-01', name: 'Singapore Hub (sin-01)', region: 'Asia Southeast (103.81°E, 1.35°N)', lat: 1.3521, lng: 103.8198, status: 'healthy' },
  { id: 'syd-01', name: 'Sydney Cluster (syd-01)', region: 'Oceania (151.20°E, -33.86°N)', lat: -33.8688, lng: 151.2093, status: 'healthy' },
  { id: 'gru-01', name: 'São Paulo Vault (gru-01)', region: 'South America (-46.63°E, -23.55°N)', lat: -23.5505, lng: -46.6333, status: 'healthy' },
];

export const NETWORK_CONNECTIONS: [string, string][] = [
  ['fra-01', 'lon-01'],
  ['fra-01', 'iad-01'],
  ['lon-01', 'iad-01'],
  ['iad-01', 'sfo-01'],
  ['sfo-01', 'hnd-01'],
  ['hnd-01', 'sin-01'],
  ['sin-01', 'fra-01'],
  ['sin-01', 'syd-01'],
  ['iad-01', 'gru-01'],
  ['fra-01', 'gru-01'],
];

interface InfrastructureGlobeProps {
  className?: string;
  chaosMode?: boolean;
  onHoverHub?: (hub: GlobeHub | null) => void;
  activeHubId?: string | null;
  interactive?: boolean;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const InfrastructureGlobe: React.FC<InfrastructureGlobeProps> = ({
  className = '',
  chaosMode = false,
  onHoverHub,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const arcMeshesRef = useRef<THREE.Line[]>([]);
  const packetParticlesRef = useRef<{ line: THREE.Line; curve: THREE.QuadraticBezierCurve3; progress: number; mesh: THREE.Mesh }[]>([]);
  const hubBeaconsRef = useRef<Map<string, { beacon: THREE.Mesh; reticle: THREE.LineSegments; hub: GlobeHub }>>(new Map());
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const hoveredHubRef = useRef<GlobeHub | null>(null);

  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const GLOBE_RADIUS = 1.45;

    // 2. Matte Obsidian Geodetic Sphere Core
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.005, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x08090a,
      roughness: 0.95,
      metalness: 0.1,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(coreSphere);

    // 3. Precision Geodetic Graticule Wireframe (Latitude Rings + Longitude Meridians)
    const graticuleGroup = new THREE.Group();
    globeGroup.add(graticuleGroup);

    const latLineMat = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.45,
    });
    const equatorMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.55,
    });

    // Latitude parallels
    const latitudes = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];
    latitudes.forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = GLOBE_RADIUS * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const segments = 64;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), y, ringRadius * Math.sin(theta)));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(ringGeo, lat === 0 ? equatorMat : latLineMat);
      graticuleGroup.add(line);
    });

    // Longitude meridians (12 meridians at 30° spacing)
    for (let i = 0; i < 12; i++) {
      const lng = (i / 12) * 360 - 180;
      const theta = (lng + 180) * (Math.PI / 180);
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const lat = (j / segments) * 180 - 90;
        const phi = (90 - lat) * (Math.PI / 180);
        const x = -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
        const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const y = GLOBE_RADIUS * Math.cos(phi);
        points.push(new THREE.Vector3(x, y, z));
      }
      const meridianGeo = new THREE.BufferGeometry().setFromPoints(points);
      const meridianLine = new THREE.Line(meridianGeo, latLineMat);
      graticuleGroup.add(meridianLine);
    }

    // 4. Subtle Outer Atmosphere Fresnel Ring (Cool Slate Cyan)
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.08, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
          vec3 atmosphericColor = mix(vec3(0.14, 0.38, 0.92), vec3(0.01, 0.52, 0.78), fresnel);
          gl_FragColor = vec4(atmosphericColor, fresnel * 0.35);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 5. Hub Nodes with Precision Crosshairs [+]
    const hubMap = new THREE.Group();
    globeGroup.add(hubMap);

    GLOBAL_HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS + 0.015);

      // Core LED dot
      const beaconGeo = new THREE.SphereGeometry(0.02, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: hub.isTarget ? 0x0284c7 : 0x2563eb,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos);
      beacon.userData = { hub };
      hubMap.add(beacon);

      // Precision [+] Vector Reticle Crosshair
      const crosshairGeo = new THREE.BufferGeometry();
      const crossSize = 0.035;
      const crossPoints = new Float32Array([
        -crossSize, 0, 0, crossSize, 0, 0, // Horizontal
        0, -crossSize, 0, 0, crossSize, 0, // Vertical
      ]);
      crosshairGeo.setAttribute('position', new THREE.BufferAttribute(crossPoints, 3));
      const crossMat = new THREE.LineBasicMaterial({
        color: hub.isTarget ? 0x0284c7 : 0x3b82f6,
        transparent: true,
        opacity: 0.75,
      });
      const reticle = new THREE.LineSegments(crosshairGeo, crossMat);
      reticle.position.copy(pos.clone().multiplyScalar(1.002));
      reticle.lookAt(0, 0, 0);
      hubMap.add(reticle);

      hubBeaconsRef.current.set(hub.id, { beacon, reticle, hub });
    });

    // 6. Directional Inter-DC Vector Laser Arcs
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const packetMeshGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const packetMeshMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    NETWORK_CONNECTIONS.forEach(([sourceId, targetId]) => {
      const source = GLOBAL_HUBS.find((h) => h.id === sourceId);
      const target = GLOBAL_HUBS.find((h) => h.id === targetId);
      if (!source || !target) return;

      const p1 = latLngToVector3(source.lat, source.lng, GLOBE_RADIUS);
      const p2 = latLngToVector3(target.lat, target.lng, GLOBE_RADIUS);

      const distance = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const altitude = GLOBE_RADIUS + distance * 0.24;
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      arcGroup.add(line);
      arcMeshesRef.current.push(line);

      // Packet Light Vector
      const packetMesh = new THREE.Mesh(packetMeshGeo, packetMeshMat);
      arcGroup.add(packetMesh);
      packetParticlesRef.current.push({
        line,
        curve,
        progress: Math.random(),
        mesh: packetMesh,
      });
    });

    // Initial rotation toward Europe / Frankfurt core
    globeGroup.rotation.y = 1.35;
    globeGroup.rotation.x = 0.28;

    // Direct Directional & Ambient Illumination
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 3, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Restrained continuous rotation
      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += delta * 0.05;
        globeGroupRef.current.rotation.x = 0.28 + mouseRef.current.y * 0.15;
        globeGroupRef.current.position.x = mouseRef.current.x * 0.12;
      }

      // Animate packet light pulses along arcs
      packetParticlesRef.current.forEach((item) => {
        item.progress = (item.progress + delta * 0.4) % 1;
        const pt = item.curve.getPoint(item.progress);
        item.mesh.position.copy(pt);
      });

      // Animate reticle crosshair pulsing
      hubBeaconsRef.current.forEach(({ reticle, hub }) => {
        const scale = 1 + Math.sin(time * 2.5 + (hub.isTarget ? 1 : 0)) * 0.25;
        reticle.scale.set(scale, scale, scale);
      });

      // Raycasting for interactive hub inspection
      if (interactive && cameraRef.current && globeGroupRef.current) {
        raycasterRef.current.setFromCamera(
          new THREE.Vector2(mouseRef.current.targetX, mouseRef.current.targetY),
          cameraRef.current
        );
        const beacons = Array.from(hubBeaconsRef.current.values()).map((v) => v.beacon);
        const intersects = raycasterRef.current.intersectObjects(beacons);

        if (intersects.length > 0) {
          const intersectedHub = intersects[0].object.userData.hub as GlobeHub;
          if (hoveredHubRef.current?.id !== intersectedHub.id) {
            hoveredHubRef.current = intersectedHub;
            onHoverHub?.(intersectedHub);
          }
        } else if (hoveredHubRef.current !== null) {
          hoveredHubRef.current = null;
          onHoverHub?.(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
    };
  }, [handleResize, handleMouseMove, interactive, onHoverHub]);

  // Reactive state updates for Chaos Mode
  useEffect(() => {
    const fraData = hubBeaconsRef.current.get('fra-01');
    if (!fraData) return;

    if (chaosMode) {
      // Shift Frankfurt and its connections into Pulsing Crimson Alarm
      (fraData.beacon.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      (fraData.reticle.material as THREE.LineBasicMaterial).color.setHex(0xef4444);

      arcMeshesRef.current.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).color.setHex(0xef4444);
        (line.material as THREE.LineBasicMaterial).opacity = 0.8;
      });
      packetParticlesRef.current.forEach((item) => {
        (item.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      });
    } else {
      // Revert to Cobalt Steel & Slate Cyan
      (fraData.beacon.material as THREE.MeshBasicMaterial).color.setHex(0x0284c7);
      (fraData.reticle.material as THREE.LineBasicMaterial).color.setHex(0x0284c7);

      arcMeshesRef.current.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).color.setHex(0x1d4ed8);
        (line.material as THREE.LineBasicMaterial).opacity = 0.38;
      });
      packetParticlesRef.current.forEach((item) => {
        (item.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      });
    }
  }, [chaosMode]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing ${className}`}
      aria-label="3D Geodetic Wireframe Infrastructure Radar"
    />
  );
};

export default InfrastructureGlobe;
