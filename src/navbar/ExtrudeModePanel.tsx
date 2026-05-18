import React, { FC } from "react";
import { ExtrudeDirection, ExtrudeOperationType } from "@vitekk02/cadjs/react";

export interface ExtrudeModePanelProps {
  extrudeOpType: ExtrudeOperationType;
  toggleExtrudeOpType: () => void;
  extrudeSelectedElements: string[];
  isExtruding: boolean;
  extrusionDepth: number;
  extrudeDirection: ExtrudeDirection | null;
  showExtrudeDimensionInput: boolean;
}

const ExtrudeModePanel: FC<ExtrudeModePanelProps> = ({
  extrudeOpType,
  toggleExtrudeOpType,
  extrudeSelectedElements,
  isExtruding,
  extrusionDepth,
  extrudeDirection,
  showExtrudeDimensionInput,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        className={`px-2 py-1 text-xs rounded ${
          extrudeOpType === "join"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={toggleExtrudeOpType}
      >
        Join
      </button>
      <button
        className={`px-2 py-1 text-xs rounded ${
          extrudeOpType === "cut"
            ? "bg-orange-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={toggleExtrudeOpType}
      >
        Cut
      </button>
      <div className="w-px h-4 bg-gray-600" />
      <span className="text-sm text-gray-400">
        {extrudeSelectedElements.length > 0
          ? isExtruding
            ? `Depth: ${extrusionDepth.toFixed(2)}${extrudeDirection ? ` (${extrudeDirection})` : ""}`
            : showExtrudeDimensionInput
              ? `Depth: ${extrusionDepth.toFixed(2)} — Enter depth, confirm to apply | Esc to cancel`
              : extrudeOpType === "cut"
                ? `${extrudeSelectedElements.length} selected — drag arrow to cut`
                : `${extrudeSelectedElements.length} selected — drag arrow to extrude`
          : "Select flat shape(s) — Ctrl/Shift+click to add"}
      </span>
      <span className="text-xs text-gray-500">
        Shift: symmetric | Ctrl: fine
      </span>
    </div>
  );
};

export default ExtrudeModePanel;
