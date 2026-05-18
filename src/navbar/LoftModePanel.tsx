import React, { FC } from "react";

export interface LoftModePanelProps {
  loftIsRuled: boolean;
  setLoftIsRuled: (ruled: boolean) => void;
  loftIsApplying: boolean;
  loftSelectedProfiles: string[];
  canLoft: boolean;
  performLoft: () => void | Promise<void>;
}

const LoftModePanel: FC<LoftModePanelProps> = ({
  loftIsRuled,
  setLoftIsRuled,
  loftIsApplying,
  loftSelectedProfiles,
  canLoft,
  performLoft,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        className={`px-2 py-1 text-xs rounded ${
          !loftIsRuled
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setLoftIsRuled(false)}
      >
        Smooth
      </button>
      <button
        className={`px-2 py-1 text-xs rounded ${
          loftIsRuled
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
        }`}
        onClick={() => setLoftIsRuled(true)}
      >
        Ruled
      </button>
      <div className="w-px h-4 bg-gray-600" />
      <span className="text-sm text-gray-400">
        {loftIsApplying
          ? "Applying loft..."
          : loftSelectedProfiles.length < 2
            ? `Select 2+ flat profiles (${loftSelectedProfiles.length} selected)`
            : `${loftSelectedProfiles.length} profiles selected`}
      </span>
      {canLoft && (
        <button
          className="flex-none px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
          onClick={() => {
            void performLoft();
          }}
        >
          Loft ({loftSelectedProfiles.length})
        </button>
      )}
      <span className="text-xs text-gray-500">Enter: apply | Esc: cancel</span>
    </div>
  );
};

export default LoftModePanel;
