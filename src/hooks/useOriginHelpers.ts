import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SKETCH_PLANE } from "@vitekk02/cadjs";

/**
 * Mount the three sketch planes (XY/XZ/YZ), the three world axes, and the
 * origin sphere into `scene`. Returns the THREE.Group ref so consumers can
 * pass it to mode hooks that snap previews against origin geometry.
 *
 * The group's child meshes carry `userData.originId` keys
 * (`origin-xy`, `origin-x-axis`, `origin-point`, …) so `originVisibility` can
 * toggle them individually without rebuilding.
 */
export function useOriginHelpers(
  scene: THREE.Scene | null,
  originVisibility: Record<string, boolean>,
): React.MutableRefObject<THREE.Group | null> {
  const originGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    group.userData.isOriginHelper = true;

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const planeSize = 4;
    const halfSize = planeSize / 2;

    // XY plane (blue)
    const xyGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    geometries.push(xyGeo);
    const xyMat = new THREE.MeshBasicMaterial({
      color: SKETCH_PLANE.xy,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    materials.push(xyMat);
    const xyPlane = new THREE.Mesh(xyGeo, xyMat);
    xyPlane.position.set(halfSize, halfSize, 0);
    xyPlane.userData.originId = "origin-xy";
    group.add(xyPlane);

    // XZ plane (green)
    const xzGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    geometries.push(xzGeo);
    const xzMat = new THREE.MeshBasicMaterial({
      color: SKETCH_PLANE.xz,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    materials.push(xzMat);
    const xzPlane = new THREE.Mesh(xzGeo, xzMat);
    xzPlane.rotation.x = -Math.PI / 2;
    xzPlane.position.set(halfSize, 0, halfSize);
    xzPlane.userData.originId = "origin-xz";
    group.add(xzPlane);

    // YZ plane (red)
    const yzGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    geometries.push(yzGeo);
    const yzMat = new THREE.MeshBasicMaterial({
      color: SKETCH_PLANE.yz,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    materials.push(yzMat);
    const yzPlane = new THREE.Mesh(yzGeo, yzMat);
    yzPlane.rotation.y = Math.PI / 2;
    yzPlane.position.set(0, halfSize, halfSize);
    yzPlane.userData.originId = "origin-yz";
    group.add(yzPlane);

    // X axis (red)
    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(planeSize, 0, 0),
    ]);
    geometries.push(xAxisGeo);
    const xAxisMat = new THREE.LineBasicMaterial({ color: SKETCH_PLANE.xAxis });
    materials.push(xAxisMat);
    const xAxis = new THREE.Line(xAxisGeo, xAxisMat);
    xAxis.userData.originId = "origin-x-axis";
    group.add(xAxis);

    // Y axis (green)
    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, planeSize, 0),
    ]);
    geometries.push(yAxisGeo);
    const yAxisMat = new THREE.LineBasicMaterial({ color: SKETCH_PLANE.yAxis });
    materials.push(yAxisMat);
    const yAxis = new THREE.Line(yAxisGeo, yAxisMat);
    yAxis.userData.originId = "origin-y-axis";
    group.add(yAxis);

    // Z axis (blue)
    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, planeSize),
    ]);
    geometries.push(zAxisGeo);
    const zAxisMat = new THREE.LineBasicMaterial({ color: SKETCH_PLANE.zAxis });
    materials.push(zAxisMat);
    const zAxis = new THREE.Line(zAxisGeo, zAxisMat);
    zAxis.userData.originId = "origin-z-axis";
    group.add(zAxis);

    const originGeo = new THREE.SphereGeometry(0.1, 16, 16);
    geometries.push(originGeo);
    const originMat = new THREE.MeshBasicMaterial({
      color: SKETCH_PLANE.origin,
    });
    materials.push(originMat);
    const originSphere = new THREE.Mesh(originGeo, originMat);
    originSphere.userData.originId = "origin-point";
    group.add(originSphere);

    group.userData.materials = materials;
    group.userData.geometries = geometries;

    scene.add(group);
    originGroupRef.current = group;

    return () => {
      if (originGroupRef.current) {
        scene.remove(originGroupRef.current);
        materials.forEach((m) => m.dispose());
        geometries.forEach((g) => g.dispose());
        originGroupRef.current = null;
      }
    };
  }, [scene]);

  useEffect(() => {
    if (!originGroupRef.current) return;
    originGroupRef.current.traverse((child) => {
      if (child.userData.originId) {
        child.visible = originVisibility[child.userData.originId] ?? true;
      }
    });
  }, [originVisibility]);

  return originGroupRef;
}
