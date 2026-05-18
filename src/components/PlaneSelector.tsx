import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PLANE_SELECTOR, SketchPlaneType } from "@vitekk02/cadjs";

interface PlaneSelectorProps {
  visible: boolean;
  onSelectPlane: (planeType: SketchPlaneType, offset?: number) => void;
  onCancel: () => void;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.Camera | null;
}

const PlaneSelector: FC<PlaneSelectorProps> = ({
  visible,
  onSelectPlane,
  onCancel,
  renderer,
  camera,
}) => {
  const [hoveredPlane, setHoveredPlane] = useState<SketchPlaneType | null>(
    null,
  );
  const [offset, setOffset] = useState<number>(0);
  const cubeContainerRef = useRef<HTMLDivElement>(null);
  const cubeSceneRef = useRef<THREE.Scene | null>(null);
  const cubeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // Track main camera via ref to avoid re-creating mini-scene on projection toggle
  const mainCameraRef = useRef(camera);
  useEffect(() => {
    mainCameraRef.current = camera;
  }, [camera]);

  // Initialize mini cube scene
  useEffect(() => {
    if (!visible || !cubeContainerRef.current) return;

    const container = cubeContainerRef.current;
    const width = 150;
    const height = 150;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PLANE_SELECTOR.background);
    cubeSceneRef.current = scene;

    // Create camera
    const cubeCamera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      100,
    );
    cubeCamera.position.set(3, 3, 3);
    cubeCamera.lookAt(0, 0, 0);
    cubeCameraRef.current = cubeCamera;

    // Create renderer
    const cubeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    cubeRenderer.setSize(width, height);
    cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(cubeRenderer.domElement);
    cubeRendererRef.current = cubeRenderer;

    // Create cube group
    const cubeGroup = new THREE.Group();
    cubeRef.current = cubeGroup;

    // Create cube wireframe
    const cubeGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const wireframe = new THREE.EdgesGeometry(cubeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: PLANE_SELECTOR.wireframe,
    });
    const cubeWireframe = new THREE.LineSegments(wireframe, lineMaterial);
    cubeGroup.add(cubeWireframe);

    // Create plane indicators
    const planeSize = 1.6;
    const planeOffset = 0.92;

    // XY plane (Top - Blue)
    const xyGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const xyMaterial = new THREE.MeshBasicMaterial({
      color: PLANE_SELECTOR.xy,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const xyPlane = new THREE.Mesh(xyGeometry, xyMaterial);
    xyPlane.position.set(0, planeOffset, 0);
    xyPlane.rotation.x = -Math.PI / 2;
    xyPlane.userData = { planeType: "XY" };
    cubeGroup.add(xyPlane);

    // XZ plane (Front - Green)
    const xzGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const xzMaterial = new THREE.MeshBasicMaterial({
      color: PLANE_SELECTOR.xz,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const xzPlane = new THREE.Mesh(xzGeometry, xzMaterial);
    xzPlane.position.set(0, 0, planeOffset);
    xzPlane.userData = { planeType: "XZ" };
    cubeGroup.add(xzPlane);

    // YZ plane (Right - Red)
    const yzGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const yzMaterial = new THREE.MeshBasicMaterial({
      color: PLANE_SELECTOR.yz,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const yzPlane = new THREE.Mesh(yzGeometry, yzMaterial);
    yzPlane.position.set(planeOffset, 0, 0);
    yzPlane.rotation.y = Math.PI / 2;
    yzPlane.userData = { planeType: "YZ" };
    cubeGroup.add(yzPlane);

    // Add axes
    const axesHelper = new THREE.AxesHelper(1.2);
    cubeGroup.add(axesHelper);

    scene.add(cubeGroup);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Sync cube rotation with main camera if available
      if (mainCameraRef.current && cubeRef.current) {
        // Get camera direction
        const cameraDirection = new THREE.Vector3();
        mainCameraRef.current.getWorldDirection(cameraDirection);

        // Position cube camera to match main camera orientation
        const distance = 4;
        cubeCamera.position.copy(cameraDirection.multiplyScalar(-distance));
        cubeCamera.lookAt(0, 0, 0);
      }

      cubeRenderer.render(scene, cubeCamera);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (
        cubeRendererRef.current &&
        container.contains(cubeRendererRef.current.domElement)
      ) {
        container.removeChild(cubeRendererRef.current.domElement);
      }
      cubeRendererRef.current?.dispose();
    };
  }, [visible]);

  // Shared raycaster for the mini cube — both click and hover need plane-mesh
  // intersections at the same NDC coordinates against the same scene subset.
  const raycastPlanes = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
    ): { intersects: THREE.Intersection[]; planes: THREE.Object3D[] } => {
      if (
        !cubeRendererRef.current ||
        !cubeCameraRef.current ||
        !cubeRef.current
      ) {
        return { intersects: [], planes: [] };
      }
      const rect = cubeRendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cubeCameraRef.current);
      const planes = cubeRef.current.children.filter(
        (child) => child instanceof THREE.Mesh && child.userData.planeType,
      );
      return { intersects: raycaster.intersectObjects(planes, false), planes };
    },
    [],
  );

  // Handle cube click
  const handleCubeClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { intersects } = raycastPlanes(event);
      if (intersects.length > 0) {
        const planeType = intersects[0]!.object.userData
          .planeType as SketchPlaneType;
        onSelectPlane(planeType, offset || undefined);
      }
    },
    [onSelectPlane, offset, raycastPlanes],
  );

  // Handle cube hover
  const handleCubeMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { intersects, planes } = raycastPlanes(event);
      if (planes.length === 0) return;

      // Reset all plane colors
      planes.forEach((plane) => {
        const mesh = plane as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const type = mesh.userData.planeType as SketchPlaneType;
        material.opacity = 0.5;
        material.color.setHex(
          type === "XY"
            ? PLANE_SELECTOR.xy
            : type === "XZ"
              ? PLANE_SELECTOR.xz
              : PLANE_SELECTOR.yz,
        );
      });

      if (intersects.length > 0) {
        const mesh = intersects[0]!.object as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 0.8;
        material.color.setHex(PLANE_SELECTOR.hover);
        setHoveredPlane(mesh.userData.planeType as SketchPlaneType);
      } else {
        setHoveredPlane(null);
      }
    },
    [raycastPlanes],
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Overlay background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto"
        onClick={onCancel}
      />

      {/* ViewCube container */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-600">
          <h3 className="text-white text-sm font-semibold mb-2 text-center">
            Select Sketch Plane
          </h3>

          {/* 3D Cube */}
          <div
            ref={cubeContainerRef}
            className="rounded overflow-hidden cursor-pointer"
            style={{ width: 150, height: 150 }}
            onClick={handleCubeClick}
            onMouseMove={handleCubeMove}
            onMouseLeave={() => setHoveredPlane(null)}
          />

          {/* Hovered plane indicator */}
          {hoveredPlane && (
            <div className="mt-2 text-center">
              <span className="text-yellow-400 font-medium text-sm">
                {hoveredPlane === "XY" && "Top (XY)"}
                {hoveredPlane === "XZ" && "Front (XZ)"}
                {hoveredPlane === "YZ" && "Right (YZ)"}
              </span>
            </div>
          )}

          {/* Offset input */}
          <div className="mt-3 flex items-center gap-2">
            <label className="text-gray-300 text-xs whitespace-nowrap">
              Offset:
            </label>
            <input
              type="number"
              step="0.5"
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm rounded bg-gray-700 text-white border border-gray-500 focus:border-blue-400 focus:outline-none"
              placeholder="0"
            />
          </div>

          {/* Quick select buttons */}
          <div className="mt-2 flex flex-col gap-1">
            <button
              className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => onSelectPlane("XY", offset || undefined)}
            >
              Top (XY){offset ? ` @ ${offset}` : ""}
            </button>
            <button
              className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-500 text-white"
              onClick={() => onSelectPlane("XZ", offset || undefined)}
            >
              Front (XZ){offset ? ` @ ${offset}` : ""}
            </button>
            <button
              className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-500 text-white"
              onClick={() => onSelectPlane("YZ", offset || undefined)}
            >
              Right (YZ){offset ? ` @ ${offset}` : ""}
            </button>
          </div>

          {/* Cancel button */}
          <button
            className="mt-3 w-full px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-500 text-white"
            onClick={onCancel}
          >
            Cancel (Esc)
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-gray-800 bg-opacity-90 rounded-lg px-4 py-2 text-white text-sm">
          Click a plane on the cube, use the buttons, or click a face on a 3D
          body
        </div>
      </div>
    </div>
  );
};

export default PlaneSelector;
