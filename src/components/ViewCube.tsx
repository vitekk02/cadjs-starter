import React, { FC, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { VIEWCUBE } from "@vitekk02/cadjs";
import { FACE_NORMALS, FaceName, NamedView } from "@vitekk02/cadjs/react";

interface ViewCubeProps {
  camera: THREE.Camera | null;
  onViewChange: (viewName: NamedView) => void;
}

// Cube half-extent and chamfer width. The inner face plane is (1 - 2c) × (1 - 2c);
// edge strips fill the c-wide chamfer gaps; corner patches sit at the 8 vertices.
const H = 0.5;
const C = 0.11;

const FACE_NAMES: FaceName[] = [
  "front",
  "back",
  "top",
  "bottom",
  "left",
  "right",
];

// Tangent (local +X after orientation) for each face, chosen so the label's
// vertical axis aligns with the main camera's up-vector for that view.
const FACE_TANGENTS: Record<FaceName, THREE.Vector3> = {
  front: new THREE.Vector3(1, 0, 0),
  back: new THREE.Vector3(-1, 0, 0),
  top: new THREE.Vector3(1, 0, 0),
  bottom: new THREE.Vector3(1, 0, 0),
  left: new THREE.Vector3(0, 0, 1),
  right: new THREE.Vector3(0, 0, -1),
};

// 12 cube edges = pairs of adjacent (non-opposite) faces. Names follow the
// NamedView union ordering so `${a}-${b}` always matches a declared view.
const EDGE_PAIRS: [FaceName, FaceName][] = [
  ["front", "top"],
  ["front", "bottom"],
  ["front", "left"],
  ["front", "right"],
  ["back", "top"],
  ["back", "bottom"],
  ["back", "left"],
  ["back", "right"],
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

// 8 cube corners = all ±X × ±Y × ±Z combinations, ordered as in the NamedView union.
const CORNER_TRIPLES: [FaceName, FaceName, FaceName][] = [
  ["front", "top", "right"],
  ["front", "top", "left"],
  ["front", "bottom", "right"],
  ["front", "bottom", "left"],
  ["back", "top", "right"],
  ["back", "top", "left"],
  ["back", "bottom", "right"],
  ["back", "bottom", "left"],
];

function createFaceTexture(
  label: string,
  isHovered: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = isHovered ? VIEWCUBE.faceHoverCss : VIEWCUBE.faceCss;
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = VIEWCUBE.faceBorderCss;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 126, 126);

  ctx.fillStyle = isHovered ? VIEWCUBE.textBold : VIEWCUBE.text;
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Builds a right-handed basis matrix so the plane's +Z axis aligns with `normal`
// and its +X axis aligns with `tangent`.
function orientPlane(
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
): THREE.Quaternion {
  const n = normal.clone().normalize();
  const t = tangent
    .clone()
    .sub(n.clone().multiplyScalar(tangent.dot(n)))
    .normalize();
  const b = new THREE.Vector3().crossVectors(n, t).normalize();
  const m = new THREE.Matrix4().makeBasis(t, b, n);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

interface RegionUserData {
  viewName: NamedView;
  regionType: "face" | "edge" | "corner";
  baseColor: number;
  hoverColor: number;
  baseTexture?: THREE.Texture;
  hoverTexture?: THREE.Texture;
}

function buildFaceRegion(name: FaceName): THREE.Mesh {
  const normal = FACE_NORMALS[name];
  const label = name.toUpperCase();
  const baseTexture = createFaceTexture(label, false);
  const hoverTexture = createFaceTexture(label, true);
  const geometry = new THREE.PlaneGeometry(1 - 2 * C, 1 - 2 * C);
  const material = new THREE.MeshBasicMaterial({
    map: baseTexture,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(normal).multiplyScalar(H);
  mesh.quaternion.copy(orientPlane(normal, FACE_TANGENTS[name]));
  const ud: RegionUserData = {
    viewName: name as NamedView,
    regionType: "face",
    baseColor: VIEWCUBE.face,
    hoverColor: VIEWCUBE.faceHover,
    baseTexture,
    hoverTexture,
  };
  mesh.userData = ud;
  return mesh;
}

function buildEdgeRegion(a: FaceName, b: FaceName): THREE.Mesh {
  const n1 = FACE_NORMALS[a];
  const n2 = FACE_NORMALS[b];
  const normal = new THREE.Vector3().addVectors(n1, n2).normalize();
  // Edge direction: perpendicular to both face normals.
  const edgeDir = new THREE.Vector3().crossVectors(n1, n2).normalize();
  const strip = new THREE.PlaneGeometry(1 - 2 * C, C * Math.SQRT2);
  const material = new THREE.MeshBasicMaterial({
    color: VIEWCUBE.face,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(strip, material);
  // Midpoint of the chamfer strip: on the 45° line between the two faces, inset by c/2.
  mesh.position
    .copy(n1)
    .add(n2)
    .multiplyScalar(H - C / 2);
  mesh.quaternion.copy(orientPlane(normal, edgeDir));
  const ud: RegionUserData = {
    viewName: `${a}-${b}` as NamedView,
    regionType: "edge",
    baseColor: VIEWCUBE.face,
    hoverColor: VIEWCUBE.faceHover,
  };
  mesh.userData = ud;
  return mesh;
}

function buildCornerRegion(a: FaceName, b: FaceName, c: FaceName): THREE.Mesh {
  const n1 = FACE_NORMALS[a];
  const n2 = FACE_NORMALS[b];
  const n3 = FACE_NORMALS[c];
  const normal = new THREE.Vector3().addVectors(n1, n2).add(n3).normalize();
  const size = C * Math.SQRT2 * 1.25;
  const patch = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({
    color: VIEWCUBE.face,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(patch, material);
  // Corner centroid on the chamfer: ((h-c, h, h-c) + perms)/3 = (h - 2c/3) · (n1+n2+n3).
  mesh.position
    .copy(n1)
    .add(n2)
    .add(n3)
    .multiplyScalar(H - (2 * C) / 3);
  // Any tangent not parallel to normal works for the square patch.
  const fallback =
    Math.abs(normal.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);
  mesh.quaternion.copy(orientPlane(normal, fallback));
  const ud: RegionUserData = {
    viewName: `${a}-${b}-${c}` as NamedView,
    regionType: "corner",
    baseColor: VIEWCUBE.face,
    hoverColor: VIEWCUBE.faceHover,
  };
  mesh.userData = ud;
  return mesh;
}

const ViewCube: FC<ViewCubeProps> = ({ camera, onViewChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const regionMeshesRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const hoveredViewRef = useRef<NamedView | null>(null);
  // Track main camera via ref so the mini-scene doesn't re-create on projection toggle
  const mainCameraRef = useRef(camera);
  useEffect(() => {
    mainCameraRef.current = camera;
  }, [camera]);

  // Initialize the mini scene (once)
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const size = container.clientWidth || 120;

    const cubeScene = new THREE.Scene();
    sceneRef.current = cubeScene;

    const cubeCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    cubeCamera.position.set(2, 2, 2);
    cubeCamera.lookAt(0, 0, 0);
    cubeCameraRef.current = cubeCamera;

    const cubeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    cubeRenderer.setSize(size, size);
    cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cubeRenderer.setClearColor(0x000000, 0);
    container.appendChild(cubeRenderer.domElement);
    rendererRef.current = cubeRenderer;

    const meshes: THREE.Mesh[] = [];
    for (const name of FACE_NAMES) meshes.push(buildFaceRegion(name));
    for (const [a, b] of EDGE_PAIRS) meshes.push(buildEdgeRegion(a, b));
    for (const [a, b, c] of CORNER_TRIPLES)
      meshes.push(buildCornerRegion(a, b, c));
    for (const mesh of meshes) cubeScene.add(mesh);
    regionMeshesRef.current = meshes;

    // Small axes indicator
    const axesGroup = new THREE.Group();
    const axisLen = 0.7;
    const axisOffset = -0.65;
    const xLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(axisOffset, axisOffset, axisOffset),
        new THREE.Vector3(axisOffset + axisLen, axisOffset, axisOffset),
      ]),
      new THREE.LineBasicMaterial({ color: 0xff4444 }),
    );
    axesGroup.add(xLine);
    const yLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(axisOffset, axisOffset, axisOffset),
        new THREE.Vector3(axisOffset, axisOffset + axisLen, axisOffset),
      ]),
      new THREE.LineBasicMaterial({ color: 0x44ff44 }),
    );
    axesGroup.add(yLine);
    const zLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(axisOffset, axisOffset, axisOffset),
        new THREE.Vector3(axisOffset, axisOffset, axisOffset + axisLen),
      ]),
      new THREE.LineBasicMaterial({ color: 0x4488ff }),
    );
    axesGroup.add(zLine);
    cubeScene.add(axesGroup);

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    cubeScene.add(ambient);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (mainCameraRef.current && cubeCameraRef.current) {
        const dir = new THREE.Vector3();
        mainCameraRef.current.getWorldDirection(dir);
        const dist = 3;
        cubeCameraRef.current.position.copy(dir.multiplyScalar(-dist));
        cubeCameraRef.current.up.copy(mainCameraRef.current.up);
        cubeCameraRef.current.lookAt(0, 0, 0);
      }
      cubeRenderer.render(cubeScene, cubeCameraRef.current!);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cubeScene.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh ||
          obj instanceof THREE.Line ||
          obj instanceof THREE.LineSegments
        ) {
          obj.geometry?.dispose();
          const ud = obj.userData as Partial<RegionUserData>;
          ud.baseTexture?.dispose();
          ud.hoverTexture?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else if (mat) {
            (mat as THREE.Material).dispose();
          }
        }
      });
      if (container.contains(cubeRenderer.domElement)) {
        container.removeChild(cubeRenderer.domElement);
      }
      cubeRenderer.dispose();
    };
  }, []);

  const pickRegion = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): THREE.Mesh | null => {
      if (!rendererRef.current || !cubeCameraRef.current) return null;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cubeCameraRef.current);
      const intersects = raycaster.intersectObjects(regionMeshesRef.current);
      return intersects.length > 0
        ? (intersects[0]!.object as THREE.Mesh)
        : null;
    },
    [],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const hit = pickRegion(event);
      if (!hit) return;
      const ud = hit.userData as RegionUserData;
      if (ud.viewName) onViewChange(ud.viewName);
    },
    [onViewChange, pickRegion],
  );

  const applyHover = useCallback((newHovered: NamedView | null) => {
    if (newHovered === hoveredViewRef.current) return;
    for (const mesh of regionMeshesRef.current) {
      const ud = mesh.userData as RegionUserData;
      const isHovered = ud.viewName === newHovered;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (ud.regionType === "face") {
        const nextMap = isHovered ? ud.hoverTexture! : ud.baseTexture!;
        if (mat.map !== nextMap) {
          mat.map = nextMap;
          mat.needsUpdate = true;
        }
      } else {
        mat.color.setHex(isHovered ? ud.hoverColor : ud.baseColor);
      }
    }
    hoveredViewRef.current = newHovered;
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const hit = pickRegion(event);
      applyHover(hit ? (hit.userData as RegionUserData).viewName : null);
    },
    [applyHover, pickRegion],
  );

  const handleMouseLeave = useCallback(() => {
    applyHover(null);
  }, [applyHover]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        height: "100%",
        cursor: "pointer",
        borderRadius: 8,
        overflow: "hidden",
      }}
    />
  );
};

export default ViewCube;
