import React, { FC } from "react";
import { FilletOperationType } from "@vitekk02/cadjs/react";

export interface FilletModePanelProps {
  filletOpType: FilletOperationType;
  toggleFilletOpType: () => void;
  filletIsApplying: boolean;
  filletSelectedElement: string | null;
  filletSelectedEdges: number[];
  filletRadius: number;
}

const FilletModePanel: FC<FilletModePanelProps> = ({
  filletOpType,
  toggleFilletOpType,
  filletIsApplying,
  filletSelectedElement,
  filletSelectedEdges,
  filletRadius,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        className={`px-2 py-1 text-xs rounded ${
          filletOpType === "fillet"
            ? "bg-orange-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={toggleFilletOpType}
      >
        Fillet
      </button>
      <button
        className={`px-2 py-1 text-xs rounded ${
          filletOpType === "chamfer"
            ? "bg-orange-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={toggleFilletOpType}
      >
        Chamfer
      </button>
      <div className="w-px h-4 bg-gray-600" />
      <span className="text-sm text-gray-400">
        {filletIsApplying
          ? "Applying..."
          : !filletSelectedElement
            ? "Select a 3D body"
            : filletSelectedEdges.length === 0
              ? "Click edges to select (Ctrl+click for multiple)"
              : `${filletSelectedEdges.length} edge(s) | Radius: ${filletRadius.toFixed(2)}`}
      </span>
      <span className="text-xs text-gray-500">F: toggle | Enter: apply</span>
    </div>
  );
};

export default FilletModePanel;
