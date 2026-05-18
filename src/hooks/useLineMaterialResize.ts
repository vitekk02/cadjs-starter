import { useEffect } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

/**
 * Sync `LineMaterial.resolution` for every fat-line material in `scene` to the
 * current window size on resize. Fat lines (Line2/LineSegments2) need their
 * resolution updated explicitly when the viewport changes — without this the
 * line thickness drifts away from the requested screen-pixel width.
 *
 * Lives in the consumer (not in cadjs library) because the scene reference is
 * owned by the visualizer context and the resize listener is window-scoped.
 */
export function useLineMaterialResize(scene: THREE.Scene | null): void {
  useEffect(() => {
    if (!scene) return;
    const handleResize = () => {
      const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
      scene.traverse((child) => {
        if (
          (child instanceof LineSegments2 || child instanceof Line2) &&
          (child.material as LineMaterial).resolution
        ) {
          (child.material as LineMaterial).resolution.copy(res);
        }
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scene]);
}
