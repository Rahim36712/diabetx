"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeDigitalTwinCanvasProps {
  score?: number;
  className?: string;
  cameraPreset?: "front" | "focus" | "top" | "orbit";
  selectedOrgan?: "all" | "pancreas" | "vascular" | "metabolic";
}

export default function ThreeDigitalTwinCanvas({
  score = 85,
  className = "",
  cameraPreset = "front",
  selectedOrgan = "all",
}: ThreeDigitalTwinCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraPresetRef = useRef(cameraPreset);
  const selectedOrganRef = useRef(selectedOrgan);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    selectedOrganRef.current = selectedOrgan;
  }, [selectedOrgan]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights - Vibrant Lime Green & Bright White
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const limePointLight = new THREE.PointLight(0x84cc16, 4.0, 10);
    limePointLight.position.set(2, 2, 2);
    scene.add(limePointLight);

    const whitePointLight = new THREE.PointLight(0xffffff, 3.0, 10);
    whitePointLight.position.set(-2, -1, 2);
    scene.add(whitePointLight);

    // Parent group for body
    const bodyGroup = new THREE.Group();

    // Material - Lime Green on Light Theme
    const twinColor = 0x84cc16;

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      emissive: twinColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x65a30d,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    // 1. Head
    const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    headMesh.position.set(0, 1.4, 0);
    bodyGroup.add(headMesh);

    const headWire = new THREE.Mesh(headGeo, wireframeMaterial);
    headWire.position.copy(headMesh.position);
    headWire.scale.set(1.02, 1.02, 1.02);
    bodyGroup.add(headWire);

    // 2. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.3, 1.1, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
    torsoMesh.position.set(0, 0.55, 0);
    bodyGroup.add(torsoMesh);

    const torsoWire = new THREE.Mesh(torsoGeo, wireframeMaterial);
    torsoWire.position.copy(torsoMesh.position);
    bodyGroup.add(torsoWire);

    // 3. Pancreas / Metabolic Core Node - White & Lime Glow
    const coreGeo = new THREE.IcosahedronGeometry(0.18, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x84cc16,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const coreNode = new THREE.Mesh(coreGeo, coreMat);
    coreNode.position.set(0, 0.45, 0.05);
    bodyGroup.add(coreNode);

    // 4. Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 1.1, 16);
    const leftArm = new THREE.Mesh(armGeo, bodyMaterial);
    leftArm.position.set(-0.58, 0.5, 0);
    leftArm.rotation.z = 0.25;
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMaterial);
    rightArm.position.set(0.58, 0.5, 0);
    rightArm.rotation.z = -0.25;
    bodyGroup.add(rightArm);

    // 5. Legs
    const legGeo = new THREE.CylinderGeometry(0.13, 0.09, 1.2, 16);
    const leftLeg = new THREE.Mesh(legGeo, bodyMaterial);
    leftLeg.position.set(-0.22, -0.55, 0);
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMaterial);
    rightLeg.position.set(0.22, -0.55, 0);
    bodyGroup.add(rightLeg);

    // 6. Cybernetic Ring FX - Lime Green
    const ringGeo = new THREE.TorusGeometry(0.85, 0.018, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.8,
    });
    const cyberRing = new THREE.Mesh(ringGeo, ringMat);
    cyberRing.rotation.x = Math.PI / 2;
    cyberRing.position.set(0, 0.45, 0);
    bodyGroup.add(cyberRing);

    scene.add(bodyGroup);

    // Particle Cloud - Lime Green
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.4;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x65a30d,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 320;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Camera preset target positions
    const presets: Record<string, { x: number; y: number; z: number }> = {
      front: { x: 0, y: 0.4, z: 4.5 },
      focus: { x: 0, y: 0.45, z: 2.1 },
      top: { x: 0, y: 3.2, z: 1.2 },
      orbit: { x: 0, y: 0.4, z: 4.5 },
    };

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const activePreset = cameraPresetRef.current;
      const activeOrgan = selectedOrganRef.current;

      // Camera Lerp based on Camera Preset Button
      let targetCam = presets[activePreset] ?? presets.front;

      if (activePreset === "orbit") {
        const orbitRadius = 4.2;
        targetCam = {
          x: Math.sin(elapsedTime * 0.5) * orbitRadius,
          y: 0.8 + Math.cos(elapsedTime * 0.3) * 0.4,
          z: Math.cos(elapsedTime * 0.5) * orbitRadius,
        };
      } else {
        // Add subtle mouse look lerp
        targetCam.x += mouseX * 0.4;
        targetCam.y += -mouseY * 0.2;
      }

      camera.position.x += (targetCam.x - camera.position.x) * 0.08;
      camera.position.y += (targetCam.y - camera.position.y) * 0.08;
      camera.position.z += (targetCam.z - camera.position.z) * 0.08;
      camera.lookAt(0, 0.4, 0);

      // Organ System Mesh Highlighting
      if (activeOrgan === "pancreas") {
        coreMat.emissiveIntensity = 3.5 + Math.sin(elapsedTime * 6) * 1.2;
        coreNode.scale.set(1.4, 1.4, 1.4);
        cyberRing.scale.set(1.0, 1.0, 1.0);
      } else if (activeOrgan === "vascular") {
        coreMat.emissiveIntensity = 1.5;
        coreNode.scale.set(1.0, 1.0, 1.0);
        cyberRing.scale.set(1.3, 1.3, 1.3);
        ringMat.opacity = 1.0;
      } else if (activeOrgan === "metabolic") {
        coreMat.emissiveIntensity = 2.5;
        const pulse = 1.1 + Math.sin(elapsedTime * 4) * 0.1;
        torsoMesh.scale.set(pulse, pulse, pulse);
      } else {
        coreMat.emissiveIntensity = 1.8 + Math.sin(elapsedTime * 3) * 0.4;
        coreNode.scale.set(1.0, 1.0, 1.0);
        cyberRing.scale.set(1.0, 1.0, 1.0);
        torsoMesh.scale.set(1.0, 1.0, 1.0);
      }

      cyberRing.rotation.z = elapsedTime * 0.6;
      particles.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      headGeo.dispose();
      torsoGeo.dispose();
      coreGeo.dispose();
      armGeo.dispose();
      legGeo.dispose();
      ringGeo.dispose();
      particleGeo.dispose();
      bodyMaterial.dispose();
      wireframeMaterial.dispose();
      coreMat.dispose();
      ringMat.dispose();
      particleMat.dispose();
    };
  }, [score]);

  return (
    <div className={`relative flex items-center justify-center font-sans ${className}`}>
      <div
        ref={mountRef}
        className="w-full h-full min-h-[280px] max-h-[400px] cursor-grab active:cursor-grabbing"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-300 text-[11px] font-mono font-extrabold text-slate-800 pointer-events-none shadow-md">
        <span className="w-2 h-2 rounded-full bg-lime-500 animate-ping" />
        3D DIGITAL TWIN SILHOUETTE
      </div>
    </div>
  );
}
