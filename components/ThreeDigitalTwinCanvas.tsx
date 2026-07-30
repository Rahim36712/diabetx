"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeDigitalTwinCanvasProps {
  score?: number;
  className?: string;
}

export default function ThreeDigitalTwinCanvas({
  score = 85,
  className = "",
}: ThreeDigitalTwinCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

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

    // Lights - Strict Lime Green & Crisp White
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const limePointLight = new THREE.PointLight(0xa3e635, 3.5, 10);
    limePointLight.position.set(2, 2, 2);
    scene.add(limePointLight);

    const whitePointLight = new THREE.PointLight(0xffffff, 2.5, 10);
    whitePointLight.position.set(-2, -1, 2);
    scene.add(whitePointLight);

    // Parent group for body
    const bodyGroup = new THREE.Group();

    // Translucent Material - Lime Green
    const twinColor = 0xa3e635;

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0e1712,
      emissive: twinColor,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xa3e635,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // 1. Head
    const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    headMesh.position.set(0, 1.4, 0);
    bodyGroup.add(headMesh);

    const headWire = new THREE.Mesh(headGeo, wireframeMaterial);
    headWire.position.copy(headMesh.position);
    headGroupWire(headWire);
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
      emissive: 0xa3e635,
      emissiveIntensity: 1.4,
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

    // 6. Cybernetic Ring FX - Lime Green & White
    const ringGeo = new THREE.TorusGeometry(0.85, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa3e635,
      transparent: true,
      opacity: 0.7,
    });
    const cyberRing = new THREE.Mesh(ringGeo, ringMat);
    cyberRing.rotation.x = Math.PI / 2;
    cyberRing.position.set(0, 0.45, 0);
    bodyGroup.add(cyberRing);

    scene.add(bodyGroup);

    function headGroupWire(w: THREE.Mesh) {
      w.scale.set(1.02, 1.02, 1.02);
    }

    // Particle Cloud - Lime Green & White
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.2;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xa3e635,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

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

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation + mouse lerp
      targetRotationY = mouseX * 0.6;
      targetRotationX = mouseY * 0.3;

      bodyGroup.rotation.y +=
        (targetRotationY + elapsedTime * 0.2 - bodyGroup.rotation.y) * 0.05;
      bodyGroup.rotation.x += (targetRotationX - bodyGroup.rotation.x) * 0.05;

      // Pulse Core Node & Cyber Ring
      const pulseScale = 1 + Math.sin(elapsedTime * 3) * 0.08;
      coreNode.scale.set(pulseScale, pulseScale, pulseScale);
      cyberRing.rotation.z = elapsedTime * 0.5;

      // Particles orbit
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
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#060A07]/90 backdrop-blur-md px-3 py-1 rounded-full border border-lime-400/40 text-[11px] font-mono font-extrabold text-lime-300 pointer-events-none shadow-md">
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
        3D DIGITAL TWIN SILHOUETTE
      </div>
    </div>
  );
}
