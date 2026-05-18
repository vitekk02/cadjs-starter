import React, { FC } from "react";
import { MeasureSubMode } from "@vitekk02/cadjs";

export interface MeasureModePanelProps {
  measureSubMode: MeasureSubMode;
  setMeasureSubMode: (mode: MeasureSubMode) => void;
  measureStatusText: string;
  pinMeasurement: (id?: string) => void;
  clearTemporaryMeasurements: () => void;
}

const MeasureModePanel: FC<MeasureModePanelProps> = ({
  measureSubMode,
  setMeasureSubMode,
  measureStatusText,
  pinMeasurement,
  clearTemporaryMeasurements,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        className={`flex-none px-2 py-1 text-xs rounded ${
          measureSubMode === "distance"
            ? "bg-green-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setMeasureSubMode("distance")}
        title="Distance (D)"
      >
        Distance
      </button>
      <button
        className={`flex-none px-2 py-1 text-xs rounded ${
          measureSubMode === "edge-length"
            ? "bg-green-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setMeasureSubMode("edge-length")}
        title="Edge Length (E)"
      >
        Edge Length
      </button>
      <button
        className={`flex-none px-2 py-1 text-xs rounded ${
          measureSubMode === "angle"
            ? "bg-green-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setMeasureSubMode("angle")}
        title="Angle (A)"
      >
        Angle
      </button>

      <div className="w-px h-4 bg-gray-600 mx-1" />

      <button
        className="flex-none px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
        onClick={() => pinMeasurement()}
        title="Pin selected or last measurement (P)"
      >
        Pin
      </button>
      <button
        className="flex-none px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
        onClick={clearTemporaryMeasurements}
        title="Clear temporary (C)"
      >
        Clear
      </button>

      <div className="w-px h-4 bg-gray-600 mx-1" />

      <span className="text-sm text-gray-400">{measureStatusText}</span>
      <span className="text-xs text-gray-500">
        D/E/A: mode | P: pin | C: clear | Del: delete | Esc: cancel
      </span>
    </div>
  );
};

export default MeasureModePanel;
