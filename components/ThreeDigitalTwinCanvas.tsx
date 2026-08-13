"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type OrganId = "all" | "pancreas" | "liver" | "heart" | "kidneys" | "vascular" | "metabolic";
export type PhysiologyLayer = "anatomy" | "blood_flow" | "metabolic_load" | "signaling";
type OrganKey = Exclude<OrganId, "all" | "metabolic">;

interface Props {
  score?: number;
  className?: string;
  cameraPreset?: "front" | "focus" | "top" | "orbit";
  selectedOrgan?: OrganId;
  layer?: PhysiologyLayer;
  organScores?: Partial<Record<OrganKey, number>>;
  onOrganSelect?: (organ: OrganKey) => void;
}

const ORGAN_BASE: Record<OrganKey, number> = {
  pancreas: 0x111111,
  liver: 0x3f3f3f,
  heart: 0x6b6b6b,
  kidneys: 0x858585,
  vascular: 0x9e9e9e,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function createOrgan(id: OrganKey, geometry: THREE.BufferGeometry, position: [number, number, number], scale: [number, number, number]) {
  const material = new THREE.MeshStandardMaterial({ color: ORGAN_BASE[id], roughness: .44, metalness: .11, transparent: true, opacity: .94 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.userData.organ = id;
  return mesh;
}

export default function ThreeDigitalTwinCanvas({ score = 80, className = "", cameraPreset = "front", selectedOrgan = "all", layer = "anatomy", organScores = {}, onOrganSelect }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef(cameraPreset);
  const selectedRef = useRef(selectedOrgan);
  const layerRef = useRef(layer);
  const scoresRef = useRef(organScores);
  const selectRef = useRef(onOrganSelect);
  useEffect(() => { presetRef.current = cameraPreset; }, [cameraPreset]);
  useEffect(() => { selectedRef.current = selectedOrgan; }, [selectedOrgan]);
  useEffect(() => { layerRef.current = layer; }, [layer]);
  useEffect(() => { scoresRef.current = organScores; }, [organScores]);
  useEffect(() => { selectRef.current = onOrganSelect; }, [onOrganSelect]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, .1, 100);
    camera.position.set(0, .35, 8.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.5); key.position.set(4, 6, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0x777777, 2.1); rim.position.set(-5, 3, -5); scene.add(rim);

    const twin = new THREE.Group(); twin.rotation.y = -.12; scene.add(twin);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(2.18, 28, 20), new THREE.MeshBasicMaterial({ color: 0xcdcdca, wireframe: true, transparent: true, opacity: .22 }));
    shell.scale.set(.78, 1.42, .56); shell.position.y = .08; twin.add(shell);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xededeb, roughness: .72, metalness: .03, transparent: true, opacity: .52 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(.48, 24, 18), bodyMaterial); head.position.y = 2.15; twin.add(head);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.58, .78, 1.85, 24), bodyMaterial); torso.position.y = .75; twin.add(torso);
    const limbMaterial = new THREE.MeshStandardMaterial({ color: 0xd5d5d2, roughness: .8, transparent: true, opacity: .72 });
    const fallbackLimbGroup = new THREE.Group(); twin.add(fallbackLimbGroup);
    const limb = (start: [number, number, number], end: [number, number, number], radius: number) => {
      const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const length = direction.length();
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.1, length, 12), limbMaterial);
      mesh.position.set((start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); fallbackLimbGroup.add(mesh);
    };
    limb([-.52, 1.35, 0], [-1.05, .15, 0], .13); limb([.52, 1.35, 0], [1.05, .15, 0], .13); limb([-.32, -.12, 0], [-.52, -2, 0], .17); limb([.32, -.12, 0], [.52, -2, 0], .17);

    const organs = new THREE.Group(); organs.position.z = .56; twin.add(organs);
    const liver = createOrgan("liver", new THREE.SphereGeometry(1, 28, 20), [.22, 1.02, 0], [.85, .38, .28]);
    const pancreas = createOrgan("pancreas", new THREE.SphereGeometry(1, 24, 16), [-.22, .52, .12], [.62, .16, .18]);
    const heart = createOrgan("heart", new THREE.SphereGeometry(1, 24, 20), [.08, .55, .42], [.28, .34, .26]);
    const kidneyLeft = createOrgan("kidneys", new THREE.SphereGeometry(1, 20, 16), [-.42, .2, .12], [.2, .34, .16]);
    const kidneyRight = createOrgan("kidneys", new THREE.SphereGeometry(1, 20, 16), [.42, .2, .12], [.2, .34, .16]);
    organs.add(liver, pancreas, heart, kidneyLeft, kidneyRight);

    const vesselMaterial = new THREE.LineBasicMaterial({ color: ORGAN_BASE.vascular, transparent: true, opacity: .78 });
    const vesselCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.9, .18), new THREE.Vector3(.2, 1.2, .3), new THREE.Vector3(0, .55, .34), new THREE.Vector3(-.18, -.15, .22), new THREE.Vector3(-.3, -1.2, .15)]);
    const vessel = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vesselCurve.getPoints(32)), vesselMaterial); vessel.userData.organ = "vascular"; organs.add(vessel);
    const branchCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .56, .34), new THREE.Vector3(-.52, .64, .22), new THREE.Vector3(-.65, 1.1, .1)]);
    const branch = new THREE.Line(new THREE.BufferGeometry().setFromPoints(branchCurve.getPoints(18)), vesselMaterial.clone()); branch.userData.organ = "vascular"; organs.add(branch);

    const signals = new THREE.Group(); signals.position.set(-.22, .52, .24); organs.add(signals);
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.28 + i * .14, .012, 8, 48), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: .14 }));
      ring.rotation.x = Math.PI / 2; ring.userData.delay = i * .9; signals.add(ring);
    }
    const flowParticles = new THREE.Group();
    const flowPoints = vesselCurve.getPoints(26);
    for (let i = 0; i < 14; i += 1) {
      const particle = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 8), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: .3 }));
      particle.userData.offset = i / 14; flowParticles.add(particle);
    }
    organs.add(flowParticles);

    const nodes = new THREE.Group();
    for (let i = 0; i < 18; i += 1) {
      const theta = (i / 18) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.SphereGeometry(.022 + (i % 3) * .008, 8, 8), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: .42 }));
      node.position.set(Math.cos(theta) * (1.08 + (i % 2) * .16), .1 + Math.sin(theta * 1.7) * 1.75, Math.sin(theta) * .56); nodes.add(node);
    }
    twin.add(nodes);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(2.55, 64), new THREE.MeshBasicMaterial({ color: 0xe3e3df, transparent: true, opacity: .42 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.13; floor.scale.set(1, .32, 1); scene.add(floor);

    const humanAsset = new THREE.Group();
    humanAsset.visible = false;
    humanAsset.rotation.y = -.12;
    scene.add(humanAsset);
    const inferAssetOrgan = (name: string): OrganKey | undefined => {
      const normalized = name.toLowerCase();
      if (normalized.includes("pancreas")) return "pancreas";
      if (normalized.includes("liver")) return "liver";
      if (normalized.includes("heart")) return "heart";
      if (normalized.includes("kidney") || normalized.includes("renal")) return "kidneys";
      if (normalized.includes("arter") || normalized.includes("vein") || normalized.includes("vascular") || normalized.includes("aorta")) return "vascular";
      return undefined;
    };
    const loader = new GLTFLoader();
    loader.load("/models/human_body.glb", (gltf) => {
      const model = gltf.scene;
      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const scale = initialSize.y > 0 ? 4.65 / initialSize.y : 1;
      model.scale.setScalar(scale);
      const normalizedBox = new THREE.Box3().setFromObject(model);
      const normalizedCenter = normalizedBox.getCenter(new THREE.Vector3());
      model.position.x -= normalizedCenter.x;
      model.position.y -= normalizedBox.min.y + 2.1;
      model.position.z -= normalizedCenter.z;
      model.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const organ = inferAssetOrgan(`${node.name} ${(node.parent?.name ?? "")}`);
        const name = `${node.name} ${(node.parent?.name ?? "")}`.toLowerCase();
        node.userData.organ = organ;
        node.userData.surface = true;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          standard.transparent = true;
          standard.opacity = node.userData.surface ? .18 : .96;
          if (standard.color) standard.color.setScalar(node.userData.surface ? .84 : .26);
          if ("roughness" in standard) standard.roughness = .68;
        });
      });
      humanAsset.add(model);
      humanAsset.visible = true;
      twin.visible = false;
    }, undefined, () => {
      humanAsset.visible = false;
      twin.visible = true;
    });
    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    const setPointer = (event: PointerEvent) => { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); };
    const pick = (event: PointerEvent, select = false) => { setPointer(event); const hits = raycaster.intersectObjects([...organs.children, ...humanAsset.children], true); const id = hits.find((hit) => hit.object.userData.organ)?.object.userData.organ as OrganKey | undefined; renderer.domElement.style.cursor = id ? "pointer" : "grab"; if (select && id) selectRef.current?.(id); };
    const pointerMove = (event: PointerEvent) => pick(event, false); const pointerUp = (event: PointerEvent) => pick(event, true);
    renderer.domElement.addEventListener("pointermove", pointerMove); renderer.domElement.addEventListener("pointerup", pointerUp);

    const presets: Record<string, THREE.Vector3> = { front: new THREE.Vector3(0, .25, 8.4), focus: new THREE.Vector3(0, .7, 5.7), top: new THREE.Vector3(0, 7.2, .35), orbit: new THREE.Vector3(4.4, 1.1, 6.5) };
    let frame = 0; let disposed = false;
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const now = Date.now() * .001;
      camera.position.lerp(presets[presetRef.current] ?? presets.front, .035); camera.lookAt(0, .15, 0);
      const selected = selectedRef.current; const activeLayer = layerRef.current; const metricScores = scoresRef.current;
      organs.children.forEach((child) => {
        const id = child.userData.organ as OrganKey | undefined;
        const emphasis = !id || selected === "all" || id === selected;
        const scoreValue = clamp(metricScores[id ?? "pancreas"] ?? score);
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          const shade = .13 + scoreValue / 100 * .66;
          material.color.setScalar(activeLayer === "metabolic_load" && id && scoreValue < 60 ? .12 : shade);
          material.opacity = emphasis ? .96 : .13;
          material.emissive.setScalar(activeLayer === "metabolic_load" && id ? (100 - scoreValue) / 280 : activeLayer === "signaling" && id === "pancreas" ? .13 : 0);
        }
        if (child instanceof THREE.Line) { const material = child.material as THREE.LineBasicMaterial; material.opacity = activeLayer === "blood_flow" ? (emphasis ? .98 : .22) : (emphasis ? .68 : .12); material.color.setScalar(activeLayer === "blood_flow" ? .08 : .55); }
      });
      humanAsset.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const id = node.userData.organ as OrganKey | undefined;
        const isSurface = Boolean(node.userData.surface);
        const emphasis = !id || selected === "all" || id === selected;
        const scoreValue = clamp(metricScores[id ?? "pancreas"] ?? score);
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          if (isSurface) {
            standard.transparent = true;
            standard.opacity = activeLayer === "anatomy" ? .2 : .11;
            if (standard.color) standard.color.setScalar(.84);
            return;
          }
          if (!id) return;
          standard.transparent = true;
          standard.opacity = emphasis ? .98 : .13;
          if (standard.color) standard.color.setScalar(activeLayer === "metabolic_load" && scoreValue < 60 ? .12 : .14 + scoreValue / 100 * .68);
          if ("emissive" in standard && standard.emissive) standard.emissive.setScalar(activeLayer === "metabolic_load" ? (100 - scoreValue) / 245 : activeLayer === "signaling" && id === "pancreas" ? .15 : 0);
        });
      });      signals.visible = activeLayer === "signaling" || selected === "pancreas";
      signals.children.forEach((ring) => { const phase = now * 1.35 + Number(ring.userData.delay ?? 0); const s = 1 + ((Math.sin(phase) + 1) / 2) * .72; ring.scale.setScalar(s); const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial; material.opacity = activeLayer === "signaling" ? .25 * (1 - (s - 1) / .72) : .06; });
      flowParticles.visible = activeLayer === "blood_flow" || selected === "vascular";
      flowParticles.children.forEach((particle) => { const offset = (Number(particle.userData.offset) + now * .18) % 1; const point = flowPoints[Math.floor(offset * (flowPoints.length - 1))]; particle.position.copy(point); const material = (particle as THREE.Mesh).material as THREE.MeshBasicMaterial; material.opacity = activeLayer === "blood_flow" ? .72 : .18; });
      twin.rotation.y += presetRef.current === "orbit" ? .003 : .0007;
      humanAsset.rotation.y += presetRef.current === "orbit" ? .003 : .0007;
      const breath = 1 + Math.sin(now * 1.1) * .008; organs.scale.setScalar(breath); nodes.rotation.y -= .0012; renderer.render(scene, camera);
    };
    animate();

    const resize = () => { const nextWidth = Math.max(container.clientWidth, 320); const nextHeight = Math.max(container.clientHeight, 320); camera.aspect = nextWidth / nextHeight; camera.updateProjectionMatrix(); renderer.setSize(nextWidth, nextHeight); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
    return () => { disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); renderer.domElement.removeEventListener("pointermove", pointerMove); renderer.domElement.removeEventListener("pointerup", pointerUp); renderer.dispose(); scene.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.Line) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => material.dispose()); } }); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, [score]);

  return <div ref={mountRef} className={`relative overflow-hidden ${className}`} aria-label={`Interactive educational organ model, score ${score}`}><div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full border border-[#d9d9d6] bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-neutral-500 backdrop-blur">Interactive system model Â· {score}/100</div></div>;
}


