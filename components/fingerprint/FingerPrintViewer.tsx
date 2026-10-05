import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { BuildResult } from '@/lib/fingerprint/engine';

export interface ViewerLabel {
  text: string;
  position: [number, number, number];
  color: string;
}

interface Props {
  result: BuildResult | null;
  labels: ViewerLabel[];
  /** Model centre in model coordinates, used as orbit target. */
  target: [number, number, number];
}

function makeLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(8, 16, 240, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 38px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 50);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sprite.scale.set(16, 6, 1);
  sprite.renderOrder = 10;
  return sprite;
}

export default function FingerPrintViewer({ result, labels, target }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    group: THREE.Group;
    render: () => void;
  } | null>(null);

  // One-time scene setup
  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
    // Front view as in the CAD file (Y up): looking at the z = 0 face that carries the finger edges,
    // straight on. On the left-hand design the pinky is on the left.
    camera.up.set(0, 1, 0);
    camera.position.set(target[0], target[1], target[2] - 250);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.6);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(60, 140, -160);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-120, -60, 120);
    scene.add(rim);

    const grid = new THREE.GridHelper(200, 20, 0xcbd5e1, 0xe2e8f0);
    grid.position.set(target[0], -17.05, target[2]);
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...target);
    controls.enableDamping = true;
    controls.update();

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    sceneRef.current = { scene, group, render: () => renderer.render(scene, camera) };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap geometry when a new design arrives
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.group.children.forEach((c) => {
      c.traverse((o: any) => {
        o.geometry?.dispose();
        o.material?.map?.dispose();
        o.material?.dispose();
      });
    });
    s.group.clear();
    if (!result) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(result.vertices, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
    geo.setIndex(new THREE.BufferAttribute(result.triangles, 1));
    // Keep the block centred on the orbit target whatever its width
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    s.group.position.x = target[0] - (bb.min.x + bb.max.x) / 2;
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.55,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    );
    s.group.add(mesh);

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(result.edges, 3));
    s.group.add(
      new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.55 })),
    );

    for (const l of labels) {
      const sprite = makeLabel(l.text, l.color);
      sprite.position.set(...l.position);
      s.group.add(sprite);
    }
  }, [result, labels]);

  return <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
}
