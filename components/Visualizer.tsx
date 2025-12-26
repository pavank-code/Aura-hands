
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ParticleConfig, GestureState, VisualShape } from '../types';

interface VisualizerProps {
  config: ParticleConfig;
  gestureState: GestureState;
}

const Visualizer: React.FC<VisualizerProps> = ({ config, gestureState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Refs to track props and prevent stale closures in the animation loop
  const configRef = useRef(config);
  const gestureRef = useRef(gestureState);
  
  const currentCenter = useRef(new THREE.Vector3(0, 0, 0));
  const currentExpansion = useRef(1.0);
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));

  // Sync props to refs
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    gestureRef.current = gestureState;
  }, [gestureState]);

  const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  };

  const generateShapePositions = (shape: VisualShape, count: number) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      if (shape === 'sphere') {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        x = 25 * Math.cos(theta) * Math.sin(phi);
        y = 25 * Math.sin(theta) * Math.sin(phi);
        z = 25 * Math.cos(phi);
      } else if (shape === 'cube') {
        x = (Math.random() - 0.5) * 45;
        y = (Math.random() - 0.5) * 45;
        z = (Math.random() - 0.5) * 45;
      } else if (shape === 'torus') {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 28, r = 10;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
      } else if (shape === 'heart') {
        const t = Math.random() * Math.PI * 2;
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        z = (Math.random() - 0.5) * 12;
        x *= 1.8; y *= 1.8;
      } else if (shape === 'dna') {
        const helixType = i % 3;
        const t = (i / count) * Math.PI * 10;
        const radius = 12;
        const pitch = 8;
        
        if (helixType === 0) {
          x = radius * Math.cos(t);
          y = radius * Math.sin(t);
          z = pitch * (t - Math.PI * 5);
        } else if (helixType === 1) {
          x = radius * Math.cos(t + Math.PI);
          y = radius * Math.sin(t + Math.PI);
          z = pitch * (t - Math.PI * 5);
        } else {
          const lerp = Math.random();
          const tFixed = Math.floor(i / 30) * (30 / count) * Math.PI * 10;
          const x1 = radius * Math.cos(tFixed);
          const y1 = radius * Math.sin(tFixed);
          const x2 = radius * Math.cos(tFixed + Math.PI);
          const y2 = radius * Math.sin(tFixed + Math.PI);
          const zFixed = pitch * (tFixed - Math.PI * 5);
          
          x = x1 + (x2 - x1) * lerp;
          y = y1 + (y2 - y1) * lerp;
          z = zFixed;
        }
        const tempX = x;
        x = tempX * 0.7 - z * 0.7;
        z = tempX * 0.7 + z * 0.7;
      }
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Increased far clipping for massive expansions
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 180;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const initParticles = (count: number) => {
      const geometry = new THREE.BufferGeometry();
      const pos = generateShapePositions(configRef.current.shape, count);
      geometry.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
      geometry.setAttribute('target', new THREE.BufferAttribute(pos.slice(), 3));

      const material = new THREE.PointsMaterial({
        size: configRef.current.size,
        map: createCircleTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8,
      });
      materialRef.current = material;
      const points = new THREE.Points(geometry, material);
      particlesRef.current = points;
      scene.add(points);
    };

    initParticles(configRef.current.count);

    const animate = (time: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const currentGesture = gestureRef.current;
      const currentCfg = configRef.current;

      if (rendererRef.current && sceneRef.current && cameraRef.current && particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        const targetAttr = particlesRef.current.geometry.attributes.target;
        
        const targetX = (currentGesture.center.x - 0.5) * -220; 
        const targetY = (currentGesture.center.y - 0.5) * -160;
        
        currentCenter.current.lerp(new THREE.Vector3(targetX, targetY, 0), 0.12);
        
        // Faster interpolation for expansion to feel snappy with finger releases
        currentExpansion.current += (currentGesture.expansion - currentExpansion.current) * 0.15;
        
        currentRotation.current.x += (currentGesture.rotation.x - currentRotation.current.x) * 0.08;
        currentRotation.current.y += (currentGesture.rotation.y - currentRotation.current.y) * 0.08;
        particlesRef.current.rotation.set(currentRotation.current.x, currentRotation.current.y, 0);

        const turbulenceSpeed = time * 0.001 * currentCfg.speed;

        for (let i = 0; i < posAttr.count; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          
          const tx = targetAttr.array[ix] * currentExpansion.current + currentCenter.current.x;
          const ty = targetAttr.array[iy] * currentExpansion.current + currentCenter.current.y;
          const tz = targetAttr.array[iz] * currentExpansion.current + currentCenter.current.z;

          // Scale turbulence with expansion so it stays visible
          const turbScale = 1.5 + (currentExpansion.current * 0.1);
          const noiseX = Math.sin(turbulenceSpeed + targetAttr.array[ix] * 0.1) * turbScale;
          const noiseY = Math.cos(turbulenceSpeed + targetAttr.array[iy] * 0.1) * turbScale;
          const noiseZ = Math.sin(turbulenceSpeed * 0.5 + targetAttr.array[iz] * 0.1) * turbScale;

          posAttr.array[ix] += (tx + noiseX - posAttr.array[ix]) * 0.15;
          posAttr.array[iy] += (ty + noiseY - posAttr.array[iy]) * 0.15;
          posAttr.array[iz] += (tz + noiseZ - posAttr.array[iz]) * 0.15;
        }
        posAttr.needsUpdate = true;

        if (materialRef.current) {
          materialRef.current.color.setHSL(currentCfg.hue / 360, currentCfg.saturation / 100, currentCfg.lightness / 100);
          
          // Amplified activity pulse for better visual feedback during "Hyper-Zoom"
          const activityPulse = currentGesture.hands.length > 0 ? 1.8 : 1.0;
          materialRef.current.size = currentCfg.size * activityPulse * (1 + Math.sin(time * 0.003) * 0.15);
        }
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate(0);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (particlesRef.current) {
      const newTargets = generateShapePositions(config.shape, config.count);
      const targetAttr = new THREE.BufferAttribute(newTargets, 3);
      
      if (config.count !== particlesRef.current.geometry.attributes.position.count) {
        particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(newTargets.slice(), 3));
      }
      particlesRef.current.geometry.setAttribute('target', targetAttr);
    }
  }, [config.shape, config.count]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default Visualizer;
