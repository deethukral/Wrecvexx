import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ShipSkin } from '../game/types';
import { RotateCw, Eye, Sparkles, Rocket, Compass } from 'lucide-react';

interface ThreeMainMenuSceneProps {
  equippedSkin: ShipSkin;
  onSelectSkin?: (skinId: string) => void;
  className?: string;
}

export type CameraPreset = 'ORBIT' | 'CINEMATIC' | 'TACTICAL' | 'THRUSTER';

export const ThreeMainMenuScene: React.FC<ThreeMainMenuSceneProps> = ({
  equippedSkin,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ORBIT');
  const [isWarpActive, setIsWarpActive] = useState<boolean>(false);
  const [isHoloScanActive, setIsHoloScanActive] = useState<boolean>(false);

  // References for animation & interaction
  const sceneStateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    shipGroup: THREE.Group | null;
    shieldGroup: THREE.Group | null;
    engineParticles: THREE.Points | null;
    warpStars: THREE.Points | null;
    scanRing: THREE.Mesh | null;
    materials: THREE.Material[];
    geometries: THREE.BufferGeometry[];
    targetCamPos: THREE.Vector3;
    targetCamLookAt: THREE.Vector3;
    currentCamLookAt: THREE.Vector3;
    pointer: { x: number; y: number; isDown: boolean; lastX: number; lastY: number; rotX: number; rotY: number };
    isWarp: boolean;
    scanProgress: number;
    clock: THREE.Clock;
    frameId: number;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    shipGroup: null,
    shieldGroup: null,
    engineParticles: null,
    warpStars: null,
    scanRing: null,
    materials: [],
    geometries: [],
    targetCamPos: new THREE.Vector3(0, 2.2, 5.2),
    targetCamLookAt: new THREE.Vector3(0, 0.2, 0),
    currentCamLookAt: new THREE.Vector3(0, 0.2, 0),
    pointer: { x: 0, y: 0, isDown: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 },
    isWarp: false,
    scanProgress: -1,
    clock: new THREE.Clock(),
    frameId: 0,
  });

  // Camera presets coordinates
  const updateCameraTarget = (preset: CameraPreset) => {
    const s = sceneStateRef.current;
    if (preset === 'ORBIT') {
      s.targetCamPos.set(0, 2.0, 5.0);
      s.targetCamLookAt.set(0, 0.2, 0);
    } else if (preset === 'CINEMATIC') {
      s.targetCamPos.set(3.2, 1.4, 3.2);
      s.targetCamLookAt.set(0, 0.1, 0);
    } else if (preset === 'TACTICAL') {
      s.targetCamPos.set(0, 6.2, 0.6);
      s.targetCamLookAt.set(0, 0, 0);
    } else if (preset === 'THRUSTER') {
      s.targetCamPos.set(0, 1.2, -4.5);
      s.targetCamLookAt.set(0, 0.3, 0);
    }
    setCameraPreset(preset);
  };

  // Toggle warp drive effect
  const handleToggleWarp = () => {
    const next = !isWarpActive;
    setIsWarpActive(next);
    sceneStateRef.current.isWarp = next;
  };

  // Trigger Holographic scan pulse
  const handleTriggerScan = () => {
    setIsHoloScanActive(true);
    sceneStateRef.current.scanProgress = 0;
    setTimeout(() => {
      setIsHoloScanActive(false);
    }, 1800);
  };

  // Update ship materials when equippedSkin changes
  useEffect(() => {
    const s = sceneStateRef.current;
    if (!s.shipGroup) return;

    const primColor = new THREE.Color(equippedSkin.primaryColor);
    const secColor = new THREE.Color(equippedSkin.accentColor);
    const glowColor = new THREE.Color(equippedSkin.accentColor || '#38bdf8');

    s.shipGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === 'hull') {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.color.copy(primColor);
          mat.roughness = equippedSkin.id === 'skin_gold' ? 0.2 : 0.35;
          mat.metalness = equippedSkin.id === 'skin_gold' ? 0.9 : 0.75;
          mat.needsUpdate = true;
        } else if (child.name === 'trim') {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.color.copy(secColor);
          mat.emissive.copy(glowColor);
          mat.emissiveIntensity = 0.6;
          mat.needsUpdate = true;
        } else if (child.name === 'engineGlow') {
          const mat = child.material as THREE.MeshBasicMaterial;
          mat.color.copy(glowColor);
          mat.needsUpdate = true;
        }
      }
    });

    if (s.shieldGroup) {
      s.shieldGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshBasicMaterial;
          mat.color.copy(glowColor);
        }
      });
    }
  }, [equippedSkin]);

  // Three.js Mount Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const s = sceneStateRef.current;

    // Detect software WebGL as per guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x060913, 0.02);
    s.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.copy(s.targetCamPos);
    s.camera = camera;

    // 3. WebGLRenderer with PBR Color Pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    s.renderer = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x141f36, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 1.4);
    scene.add(hemiLight);

    // Warm Sun / Key Light
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 3.5);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool Sci-Fi Cyan Fill Light
    const cyanFill = new THREE.PointLight(0x06b6d4, 4.0, 15);
    cyanFill.position.set(-4, 2, 2);
    scene.add(cyanFill);

    // Warm Violet Rim Light
    const rimLight = new THREE.PointLight(0x8b5cf6, 4.5, 15);
    rimLight.position.set(0, 1.5, -4);
    scene.add(rimLight);

    // 6. Procedural Composite 3D Starfighter (THREE.Group with 10+ parts)
    const shipGroup = new THREE.Group();
    s.shipGroup = shipGroup;
    scene.add(shipGroup);

    const primColor = new THREE.Color(equippedSkin.primaryColor);
    const secColor = new THREE.Color(equippedSkin.accentColor);
    const glowColor = new THREE.Color(equippedSkin.accentColor || '#38bdf8');

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: primColor,
      metalness: 0.8,
      roughness: 0.3,
    });
    s.materials.push(hullMat);

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.9,
      roughness: 0.25,
    });
    s.materials.push(carbonMat);

    const trimMat = new THREE.MeshStandardMaterial({
      color: secColor,
      emissive: glowColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
    });
    s.materials.push(trimMat);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: isSoftwareGl ? 0 : 0.85,
      opacity: isSoftwareGl ? 0.55 : 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.52,
      reflectivity: 0.9,
    });
    s.materials.push(canopyMat);

    const engineGlowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
    });
    s.materials.push(engineGlowMat);

    // --- (1) Fuselage Core ---
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 2.2);
    hullShape.lineTo(0.5, 0.4);
    hullShape.lineTo(0.65, -1.2);
    hullShape.lineTo(0.3, -1.8);
    hullShape.lineTo(-0.3, -1.8);
    hullShape.lineTo(-0.65, -1.2);
    hullShape.lineTo(-0.5, 0.4);
    hullShape.closePath();

    const hullExtrudeGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.12,
    });
    hullExtrudeGeo.center();
    s.geometries.push(hullExtrudeGeo);

    const hullMesh = new THREE.Mesh(hullExtrudeGeo, hullMat);
    hullMesh.name = 'hull';
    hullMesh.rotation.x = Math.PI / 2;
    hullMesh.position.y = 0.22;
    hullMesh.castShadow = !isSoftwareGl;
    shipGroup.add(hullMesh);

    // --- (2) Cockpit Canopy ---
    const canopyGeo = new THREE.SphereGeometry(0.38, 24, 16);
    canopyGeo.scale(0.8, 0.55, 2.2);
    s.geometries.push(canopyGeo);

    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.45, 0.2);
    shipGroup.add(canopyMesh);

    // Canopy interior pilot HUD ring
    const hudRingGeo = new THREE.TorusGeometry(0.18, 0.015, 8, 24);
    s.geometries.push(hudRingGeo);
    const hudRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    s.materials.push(hudRingMat);
    const hudRing = new THREE.Mesh(hudRingGeo, hudRingMat);
    hudRing.rotation.x = Math.PI / 2;
    hudRing.position.set(0, 0.45, 0.4);
    shipGroup.add(hudRing);

    // --- (3) Delta Wings (Swept Aerodynamic Geometry) ---
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.5);
    wingShape.lineTo(2.5, -1.0);
    wingShape.lineTo(2.35, -1.45);
    wingShape.lineTo(0.5, -0.9);
    wingShape.lineTo(0, -0.7);
    wingShape.closePath();

    const wingExtrudeGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    s.geometries.push(wingExtrudeGeo);

    // Right Wing
    const rightWing = new THREE.Mesh(wingExtrudeGeo, hullMat);
    rightWing.name = 'hull';
    rightWing.rotation.x = Math.PI / 2;
    rightWing.position.set(0.3, 0.16, -0.1);
    rightWing.castShadow = !isSoftwareGl;
    shipGroup.add(rightWing);

    // Left Wing (Mirrored)
    const leftWing = new THREE.Mesh(wingExtrudeGeo, hullMat);
    leftWing.name = 'hull';
    leftWing.rotation.x = Math.PI / 2;
    leftWing.scale.set(-1, 1, 1);
    leftWing.position.set(-0.3, 0.16, -0.1);
    leftWing.castShadow = !isSoftwareGl;
    shipGroup.add(leftWing);

    // --- (4) Wingtip Cannons & Trim Accents ---
    const cannonGeo = new THREE.CylinderGeometry(0.045, 0.055, 1.4, 12);
    cannonGeo.rotateX(Math.PI / 2);
    s.geometries.push(cannonGeo);

    const rightCannon = new THREE.Mesh(cannonGeo, carbonMat);
    rightCannon.position.set(2.4, 0.18, -0.7);
    shipGroup.add(rightCannon);

    const leftCannon = new THREE.Mesh(cannonGeo, carbonMat);
    leftCannon.position.set(-2.4, 0.18, -0.7);
    shipGroup.add(leftCannon);

    // Cannon Nozzle Tips with glowing plasma
    const tipGeo = new THREE.SphereGeometry(0.055, 12, 12);
    s.geometries.push(tipGeo);

    const rightTip = new THREE.Mesh(tipGeo, engineGlowMat);
    rightTip.name = 'engineGlow';
    rightTip.position.set(2.4, 0.18, 0.0);
    shipGroup.add(rightTip);

    const leftTip = new THREE.Mesh(tipGeo, engineGlowMat);
    leftTip.name = 'engineGlow';
    leftTip.position.set(-2.4, 0.18, 0.0);
    shipGroup.add(leftTip);

    // --- (5) Wing Winglets / Stabilizers ---
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.5, 0.6);
    finShape.lineTo(0.1, 0.6);
    finShape.lineTo(-0.2, 0);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    s.geometries.push(finGeo);

    const rightFin = new THREE.Mesh(finGeo, trimMat);
    rightFin.name = 'trim';
    rightFin.rotation.y = -0.15;
    rightFin.position.set(2.35, 0.16, -1.4);
    shipGroup.add(rightFin);

    const leftFin = new THREE.Mesh(finGeo, trimMat);
    leftFin.name = 'trim';
    leftFin.rotation.y = 0.15;
    leftFin.scale.set(-1, 1, 1);
    leftFin.position.set(-2.35, 0.16, -1.4);
    shipGroup.add(leftFin);

    // --- (6) Twin Ion Thruster Bells ---
    const thrusterBellGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.65, 18);
    thrusterBellGeo.rotateX(Math.PI / 2);
    s.geometries.push(thrusterBellGeo);

    const rightThruster = new THREE.Mesh(thrusterBellGeo, carbonMat);
    rightThruster.position.set(0.38, 0.22, -1.8);
    shipGroup.add(rightThruster);

    const leftThruster = new THREE.Mesh(thrusterBellGeo, carbonMat);
    leftThruster.position.set(-0.38, 0.22, -1.8);
    shipGroup.add(leftThruster);

    // Core Plasma Glow Discs
    const glowDiscGeo = new THREE.CircleGeometry(0.16, 18);
    s.geometries.push(glowDiscGeo);

    const rightPlasma = new THREE.Mesh(glowDiscGeo, engineGlowMat);
    rightPlasma.name = 'engineGlow';
    rightPlasma.rotation.y = Math.PI;
    rightPlasma.position.set(0.38, 0.22, -2.13);
    shipGroup.add(rightPlasma);

    const leftPlasma = new THREE.Mesh(glowDiscGeo, engineGlowMat);
    leftPlasma.name = 'engineGlow';
    leftPlasma.rotation.y = Math.PI;
    leftPlasma.position.set(-0.38, 0.22, -2.13);
    shipGroup.add(leftPlasma);

    // --- (7) Holographic Orbital Shield Rings ---
    const shieldGroup = new THREE.Group();
    s.shieldGroup = shieldGroup;
    shipGroup.add(shieldGroup);

    const shieldRingGeo1 = new THREE.TorusGeometry(3.0, 0.012, 8, 64);
    s.geometries.push(shieldRingGeo1);
    const shieldRingMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.35,
    });
    s.materials.push(shieldRingMat);

    const shieldRing1 = new THREE.Mesh(shieldRingGeo1, shieldRingMat);
    shieldRing1.rotation.x = Math.PI / 3;
    shieldGroup.add(shieldRing1);

    const shieldRingGeo2 = new THREE.TorusGeometry(2.6, 0.008, 8, 48);
    s.geometries.push(shieldRingGeo2);
    const shieldRing2 = new THREE.Mesh(shieldRingGeo2, shieldRingMat);
    shieldRing2.rotation.y = Math.PI / 4;
    shieldGroup.add(shieldRing2);

    // Holographic Scan Pulse Ring
    const scanRingGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.08, 36, 1, true);
    s.geometries.push(scanRingGeo);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    s.materials.push(scanRingMat);
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.position.y = 0.2;
    shipGroup.add(scanRing);
    s.scanRing = scanRing;

    // --- (8) Hangar Launch Pad & Runway Lights ---
    const padGroup = new THREE.Group();
    scene.add(padGroup);

    const padPlatformGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.2, 48);
    s.geometries.push(padPlatformGeo);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.6,
      metalness: 0.7,
    });
    s.materials.push(padMat);

    const padPlatform = new THREE.Mesh(padPlatformGeo, padMat);
    padPlatform.position.y = -0.55;
    padPlatform.receiveShadow = !isSoftwareGl;
    padGroup.add(padPlatform);

    // Imperial Gold Hex Docking Decal on floor
    const hexDecalGeo = new THREE.RingGeometry(1.6, 1.68, 6);
    s.geometries.push(hexDecalGeo);
    const hexDecalMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    s.materials.push(hexDecalMat);
    const hexDecal = new THREE.Mesh(hexDecalGeo, hexDecalMat);
    hexDecal.rotation.x = Math.PI / 2;
    hexDecal.position.y = -0.44;
    padGroup.add(hexDecal);

    // Outer Runway Beacon Ring
    const runwayRingGeo = new THREE.RingGeometry(3.6, 3.65, 48);
    s.geometries.push(runwayRingGeo);
    const runwayRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    s.materials.push(runwayRingMat);
    const runwayRing = new THREE.Mesh(runwayRingGeo, runwayRingMat);
    runwayRing.rotation.x = Math.PI / 2;
    runwayRing.position.y = -0.44;
    padGroup.add(runwayRing);

    // Soft Contact Shadow Plane Grounding
    const contactShadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    s.geometries.push(contactShadowGeo);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
    });
    s.materials.push(contactShadowMat);
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.445;
    padGroup.add(contactShadow);

    // --- (9) Dynamic Deep Space Particle Nebula & Starfield ---
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 18 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      // Star tint variation (cyan, violet, warm white)
      const rChoice = Math.random();
      if (rChoice < 0.4) {
        starColors[idx] = 0.5;
        starColors[idx + 1] = 0.85;
        starColors[idx + 2] = 1.0;
      } else if (rChoice < 0.7) {
        starColors[idx] = 0.85;
        starColors[idx + 1] = 0.55;
        starColors[idx + 2] = 1.0;
      } else {
        starColors[idx] = 0.95;
        starColors[idx + 1] = 0.95;
        starColors[idx + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    s.geometries.push(starGeo);

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    s.materials.push(starMat);

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    s.warpStars = starField;

    // --- (10) Engine Exhaust Particle System ---
    const exhaustCount = 120;
    const exhaustGeo = new THREE.BufferGeometry();
    const exhaustPositions = new Float32Array(exhaustCount * 3);
    const exhaustLifes = new Float32Array(exhaustCount);

    for (let i = 0; i < exhaustCount; i++) {
      exhaustLifes[i] = Math.random();
      const pIdx = i * 3;
      const side = i % 2 === 0 ? 0.38 : -0.38;
      exhaustPositions[pIdx] = side + (Math.random() - 0.5) * 0.1;
      exhaustPositions[pIdx + 1] = 0.22 + (Math.random() - 0.5) * 0.1;
      exhaustPositions[pIdx + 2] = -2.1 - exhaustLifes[i] * 3.5;
    }
    exhaustGeo.setAttribute('position', new THREE.BufferAttribute(exhaustPositions, 3));
    s.geometries.push(exhaustGeo);

    const exhaustMat = new THREE.PointsMaterial({
      color: glowColor,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    s.materials.push(exhaustMat);

    const exhaustPoints = new THREE.Points(exhaustGeo, exhaustMat);
    shipGroup.add(exhaustPoints);
    s.engineParticles = exhaustPoints;

    // Pointer Interactivity Listeners
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      s.pointer.isDown = true;
      s.pointer.lastX = clientX;
      s.pointer.lastY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      s.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      s.pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (s.pointer.isDown) {
        const deltaX = clientX - s.pointer.lastX;
        const deltaY = clientY - s.pointer.lastY;
        s.pointer.rotY += deltaX * 0.008;
        s.pointer.rotX = Math.max(-0.6, Math.min(0.6, s.pointer.rotX + deltaY * 0.008));
        s.pointer.lastX = clientX;
        s.pointer.lastY = clientY;
      }
    };

    const onPointerUp = () => {
      s.pointer.isDown = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Main 60 FPS Render Loop with Smooth Spring Physics
    const renderTick = () => {
      const dt = Math.min(0.1, s.clock.getDelta());
      const elapsed = s.clock.getElapsedTime();

      // 1. Organic Ship Idle Hover & Tilt
      if (s.shipGroup) {
        const hoverY = Math.sin(elapsed * 1.8) * 0.12;
        const hoverRoll = Math.sin(elapsed * 1.2) * 0.05;
        const hoverPitch = Math.cos(elapsed * 1.5) * 0.03;

        s.shipGroup.position.y = 0.15 + hoverY;

        // Apply interactive user drag rotation + idle hover roll
        s.shipGroup.rotation.y = THREE.MathUtils.damp(
          s.shipGroup.rotation.y,
          s.pointer.rotY + (s.pointer.x * 0.25),
          6,
          dt
        );
        s.shipGroup.rotation.x = THREE.MathUtils.damp(
          s.shipGroup.rotation.x,
          s.pointer.rotX + hoverPitch - (s.pointer.y * 0.2),
          6,
          dt
        );
        s.shipGroup.rotation.z = THREE.MathUtils.damp(
          s.shipGroup.rotation.z,
          hoverRoll - (s.pointer.x * 0.15),
          5,
          dt
        );
      }

      // 2. Shield Rings Gyroscopic Spin
      if (s.shieldGroup) {
        s.shieldGroup.rotation.x += dt * 0.5;
        s.shieldGroup.rotation.y += dt * 0.8;
      }

      // 3. Holographic Scan Ring Pulse
      if (s.scanRing && s.scanProgress >= 0) {
        s.scanProgress += dt * 1.8;
        const zPos = 2.0 - s.scanProgress * 3.5;
        s.scanRing.position.z = zPos;
        const scanMat = s.scanRing.material as THREE.MeshBasicMaterial;
        scanMat.opacity = Math.max(0, Math.sin(s.scanProgress * Math.PI) * 0.75);

        if (s.scanProgress > 1.2) {
          s.scanProgress = -1;
          scanMat.opacity = 0;
        }
      }

      // 4. Engine Exhaust Flow
      if (s.engineParticles) {
        const positions = s.engineParticles.geometry.attributes.position.array as Float32Array;
        const speed = s.isWarp ? 14.0 : 4.5;
        for (let i = 0; i < exhaustCount; i++) {
          const pIdx = i * 3;
          positions[pIdx + 2] -= dt * speed;
          if (positions[pIdx + 2] < -5.5) {
            positions[pIdx + 2] = -2.1;
          }
        }
        s.engineParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 5. Starfield Drift & Warp Stretch
      if (s.warpStars) {
        s.warpStars.rotation.y += dt * (s.isWarp ? 0.35 : 0.02);
        if (s.isWarp) {
          s.warpStars.scale.z = THREE.MathUtils.damp(s.warpStars.scale.z, 2.5, 8, dt);
        } else {
          s.warpStars.scale.z = THREE.MathUtils.damp(s.warpStars.scale.z, 1.0, 5, dt);
        }
      }

      // 6. Camera Damped Transitions
      camera.position.x = THREE.MathUtils.damp(camera.position.x, s.targetCamPos.x + s.pointer.x * 0.5, 4, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, s.targetCamPos.y + s.pointer.y * 0.4, 4, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, s.targetCamPos.z, 4, dt);

      s.currentCamLookAt.x = THREE.MathUtils.damp(s.currentCamLookAt.x, s.targetCamLookAt.x, 5, dt);
      s.currentCamLookAt.y = THREE.MathUtils.damp(s.currentCamLookAt.y, s.targetCamLookAt.y, 5, dt);
      s.currentCamLookAt.z = THREE.MathUtils.damp(s.currentCamLookAt.z, s.targetCamLookAt.z, 5, dt);
      camera.lookAt(s.currentCamLookAt);

      // Render
      renderer.render(scene, camera);
      s.frameId = requestAnimationFrame(renderTick);
    };

    s.frameId = requestAnimationFrame(renderTick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(s.frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // Dispose geometries
      s.geometries.forEach((g) => g.dispose());
      s.geometries = [];

      // Dispose materials
      s.materials.forEach((m) => m.dispose());
      s.materials = [];

      if (s.renderer) {
        s.renderer.dispose();
        if (s.renderer.domElement && s.renderer.domElement.parentNode) {
          s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
        }
        s.renderer = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas Host */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Cybernetic Viewport Framing Grids */}
      <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 rounded-2xl overflow-hidden">
        {/* Top-Left Reticle */}
        <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono text-cyan-400/80 bg-slate-950/70 px-2.5 py-1 rounded border border-cyan-500/30 backdrop-blur-xs">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span>3D HANGAR // ORBITAL BAY 04</span>
        </div>

        {/* Top-Right Telemetry */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-xs hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>SYS: {equippedSkin.name.toUpperCase()}</span>
          <span>·</span>
          <span>60 FPS</span>
        </div>

        {/* Bottom Interactive 3D Camera & FX Toolbar */}
        <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Camera Angles */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 backdrop-blur-xs text-[10px] font-pixel">
            <button
              onClick={() => updateCameraTarget('ORBIT')}
              className={`px-2 py-1 rounded transition ${
                cameraPreset === 'ORBIT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ORBIT
            </button>
            <button
              onClick={() => updateCameraTarget('CINEMATIC')}
              className={`px-2 py-1 rounded transition ${
                cameraPreset === 'CINEMATIC'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CINEMATIC
            </button>
            <button
              onClick={() => updateCameraTarget('TACTICAL')}
              className={`px-2 py-1 rounded transition ${
                cameraPreset === 'TACTICAL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TACTICAL
            </button>
            <button
              onClick={() => updateCameraTarget('THRUSTER')}
              className={`px-2 py-1 rounded transition ${
                cameraPreset === 'THRUSTER'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              THRUSTERS
            </button>
          </div>

          {/* Action Triggers: Holo Scan & Warp Drive */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTriggerScan}
              disabled={isHoloScanActive}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-pixel flex items-center gap-1 transition ${
                isHoloScanActive
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/80 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60'
              }`}
              title="Pulse holographic diagnostic scan line across the starfighter"
            >
              <Sparkles className="w-3 h-3" />
              <span>HOLO SCAN</span>
            </button>

            <button
              onClick={handleToggleWarp}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-pixel flex items-center gap-1 transition ${
                isWarpActive
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold border-amber-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title="Ignite ion thrusters and accelerate starfield"
            >
              <Rocket className="w-3 h-3" />
              <span>{isWarpActive ? 'WARP BURST ON' : 'ION BOOST'}</span>
            </button>
          </div>
        </div>

        {/* Hint text */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none hidden md:flex flex-col gap-1 text-[9px] font-mono text-slate-500/70">
          <span>DRAG ↔ ROTATE 360°</span>
          <span>HOVER ↔ PARALLAX TILT</span>
        </div>
      </div>
    </div>
  );
};
