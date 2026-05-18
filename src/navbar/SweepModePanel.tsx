import React, { FC } from "react";
import {
  SweepCornerMode,
  SweepOrientation,
  SweepPhase,
} from "@vitekk02/cadjs/react";

export interface SweepModePanelProps {
  sweepOrientation: SweepOrientation;
  setSweepOrientation: (orientation: SweepOrientation) => void;
  sweepCornerMode: SweepCornerMode;
  setSweepCornerMode: (mode: SweepCornerMode) => void;
  sweepIsApplying: boolean;
  sweepPhase: SweepPhase;
  canSweep: boolean;
  performSweep: () => void | Promise<void>;
}

const SweepModePanel: FC<SweepModePanelProps> = ({
  sweepOrientation,
  setSweepOrientation,
  sweepCornerMode,
  setSweepCornerMode,
  sweepIsApplying,
  sweepPhase,
  canSweep,
  performSweep,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        className={`px-2 py-1 text-xs rounded ${
          sweepOrientation === "perpendicular"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setSweepOrientation("perpendicular")}
      >
        Perpendicular
      </button>
      <button
        className={`px-2 py-1 text-xs rounded ${
          sweepOrientation === "parallel"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setSweepOrientation("parallel")}
      >
        Parallel
      </button>
      <div className="w-px h-4 bg-gray-600" />
      <button
        className={`px-2 py-1 text-xs rounded ${
          sweepCornerMode === "right"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setSweepCornerMode("right")}
      >
        Right
      </button>
      <button
        className={`px-2 py-1 text-xs rounded ${
          sweepCornerMode === "round"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setSweepCornerMode("round")}
      >
        Round
      </button>
      <div className="w-px h-4 bg-gray-600" />
      <span className="text-sm text-gray-400">
        {sweepIsApplying
          ? "Applying sweep..."
          : sweepPhase === "SELECT_PROFILE"
            ? "Select a flat profile"
            : sweepPhase === "SELECT_PATH"
              ? "Select a path"
              : "Ready to sweep"}
      </span>
      {canSweep && (
        <button
          className="flex-none px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
          onClick={() => {
            void performSweep();
          }}
        >
          Sweep
        </button>
      )}
      <span className="text-xs text-gray-500">Enter: apply | Esc: cancel</span>
    </div>
  );
};

export default SweepModePanel;
