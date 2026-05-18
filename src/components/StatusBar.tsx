import React from "react";
import * as THREE from "three";
import { SceneElement, SceneMode, Sketch } from "@vitekk02/cadjs";

interface StatusBarProps {
  cursorPosition: THREE.Vector3 | null;
  mode: SceneMode;
  activeSketch: Sketch | null;
  moveSelectedObject: string | null;
  elements: SceneElement[];
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorPosition,
  mode,
  activeSketch,
  moveSelectedObject,
  elements,
}) => {
  const selectedElement = moveSelectedObject
    ? (elements.find((el) => el.nodeId === moveSelectedObject) ?? null)
    : null;

  return (
    <div className="hidden sm:flex absolute bottom-0 left-0 right-0 h-8 bg-gray-900 bg-opacity-90 border-t border-gray-700 items-center px-3 text-xs text-gray-400 font-mono z-10 overflow-hidden whitespace-nowrap">
      <span className="flex-none">
        X: {cursorPosition ? cursorPosition.x.toFixed(2) : "--"} Y:{" "}
        {cursorPosition ? cursorPosition.y.toFixed(2) : "--"} Z:{" "}
        {cursorPosition ? cursorPosition.z.toFixed(2) : "--"}
      </span>

      {mode === "sketch" && activeSketch && (
        <span className="hidden md:contents">
          <div className="flex-none w-px h-4 bg-gray-600 mx-2" />
          <span className="flex-none text-blue-400">
            {activeSketch.plane.type}
          </span>
          <div className="flex-none w-px h-4 bg-gray-600 mx-2" />
          <span className="flex-none">
            DOF:{" "}
            <span
              className={
                activeSketch.dof === 0 ? "text-green-400" : "text-yellow-400"
              }
            >
              {activeSketch.dof}
            </span>
          </span>
          <div className="flex-none w-px h-4 bg-gray-600 mx-2" />
          <span
            className={`flex-none ${
              activeSketch.status === "fully_constrained"
                ? "text-green-400"
                : activeSketch.status === "overconstrained"
                  ? "text-red-400"
                  : "text-yellow-400"
            }`}
          >
            {activeSketch.status === "fully_constrained"
              ? "Constrained"
              : activeSketch.status === "overconstrained"
                ? "Over"
                : "Under"}
          </span>
          <div className="flex-none w-px h-4 bg-gray-600 mx-2" />
          <span className="flex-none">
            {activeSketch.primitives.length}P {activeSketch.constraints.length}C
          </span>
        </span>
      )}

      {selectedElement && moveSelectedObject && (
        <span className="ml-auto flex-none truncate">
          {moveSelectedObject} ({selectedElement.position.x.toFixed(1)},{" "}
          {selectedElement.position.y.toFixed(1)},{" "}
          {selectedElement.position.z.toFixed(1)})
        </span>
      )}
    </div>
  );
};
