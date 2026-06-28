"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// 1. Define the custom shader material for liquid morphology
const LiquidShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uTex1: new THREE.Texture(),
    uTex2: new THREE.Texture(),
    uDispMap: new THREE.Texture(),
    uIntensity: 1.5,
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform sampler2D uDispMap;
    uniform float uIntensity;

    void main() {
      // Dynamic flowing displacement coordinates
      vec2 dispUv = vUv;
      dispUv.y -= uTime * 0.1;
      dispUv.x += uTime * 0.05;
      
      vec4 disp = texture2D(uDispMap, dispUv);
      
      // Liquid math based on displacement map
      vec2 distortedPosition1 = vUv + disp.rg * uIntensity * uProgress;
      vec2 distortedPosition2 = vUv - disp.rg * uIntensity * (1.0 - uProgress);

      vec4 _texture1 = texture2D(uTex1, distortedPosition1);
      vec4 _texture2 = texture2D(uTex2, distortedPosition2);

      gl_FragColor = mix(_texture1, _texture2, uProgress);
    }
  `
);

extend({ LiquidShaderMaterial });

// @ts-expect-error custom material properties
type LiquidShaderMaterialImpl = {
  uTime: number;
  uProgress: number;
  uTex1: THREE.Texture;
  uTex2: THREE.Texture;
  uDispMap: THREE.Texture;
  uIntensity: number;
} & JSX.IntrinsicElements['shaderMaterial'];

// Default placeholder procedural textures are used instead of external URLs to avoid CORS / missing file black screens.
// You can switch back to `useTexture(['/image1.jpg', ...])` once you have the image files in your `public` folder.

function Scene() {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial & { uTime: number, uProgress: number }>(null);
  
  const [hovered, setHovered] = useState(false);
  const targetProgress = useRef(0);

  // Procedural fallback textures
  const { tex1, tex2, clonedDisp } = useMemo(() => {
    // Cyberpunk purple gradient (Image 1)
    const data1 = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        const idx = (i * 256 + j) * 4;
        data1[idx] = 143 - (i / 256) * 50; // R
        data1[idx + 1] = 68; // G
        data1[idx + 2] = 240 - (j / 256) * 100; // B
        data1[idx + 3] = 255;
      }
    }
    const t1 = new THREE.DataTexture(data1, 256, 256, THREE.RGBAFormat);
    t1.needsUpdate = true;

    // Matrix green abstract (Image 2)
    const data2 = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        const idx = (i * 256 + j) * 4;
        data2[idx] = 10; // R
        data2[idx + 1] = 180 + Math.random() * 50; // G (static noise)
        data2[idx + 2] = 50 + (i / 256) * 50; // B
        data2[idx + 3] = 255;
      }
    }
    const t2 = new THREE.DataTexture(data2, 256, 256, THREE.RGBAFormat);
    t2.needsUpdate = true;

    // Noise displacement map
    const noise = new Uint8Array(128 * 128 * 4);
    for (let i = 0; i < noise.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      noise[i] = val;
      noise[i + 1] = val;
      noise[i + 2] = val;
      noise[i + 3] = 255;
    }
    const disp = new THREE.DataTexture(noise, 128, 128, THREE.RGBAFormat);
    disp.wrapS = disp.wrapT = THREE.RepeatWrapping;
    disp.needsUpdate = true;

    return { tex1: t1, tex2: t2, clonedDisp: disp };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      
      // Smoothly interpolate progress using lerp
      targetProgress.current = THREE.MathUtils.lerp(
        targetProgress.current,
        hovered ? 1 : 0,
        delta * 3.5
      );
      materialRef.current.uProgress = targetProgress.current;
    }
  });

  return (
    <mesh 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
      {/* @ts-expect-error custom material */}
      <liquidShaderMaterial
        ref={materialRef}
        uTex1={tex1}
        uTex2={tex2}
        uDispMap={clonedDisp}
        uIntensity={1.2}
      />
    </mesh>
  );
}

export default function LiquidSlideshow() {
  return (
    <div className="w-full h-full relative group rounded-3xl overflow-hidden cursor-crosshair border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <React.Suspense fallback={null}>
          <Scene />
        </React.Suspense>
      </Canvas>
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      
      {/* Bottom Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent pointer-events-none opacity-80" />
      
      <div className="absolute bottom-6 left-6 text-white pointer-events-none">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#a1a1aa] transition-colors group-hover:text-white drop-shadow-md">
          <span className="text-[#8F44F0]">{"//"}</span> HOVER TO INITIATE MORPH
        </h3>
      </div>
    </div>
  );
}
