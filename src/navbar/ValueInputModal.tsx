import React, { FC } from "react";
import { ConstraintType, getConstraintLabel } from "@vitekk02/cadjs";
import { NumberInput } from "../components/NumberInput";

interface ValueInputModalProps {
  constraintType: ConstraintType;
  defaultValue?: number | undefined;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

const UNIT: Partial<Record<ConstraintType, string>> = {
  angle: "deg",
  radius: "units",
  diameter: "units",
  distance: "units",
  distanceX: "units",
  distanceY: "units",
};

const ValueInputModal: FC<ValueInputModalProps> = ({
  constraintType,
  defaultValue = 0,
  onConfirm,
  onCancel,
}) => (
  <div className="p-2 bg-gray-600 rounded mt-2">
    <div className="text-sm text-gray-300 mb-1">
      Enter {getConstraintLabel(constraintType).toLowerCase()}:
    </div>
    <div className="flex gap-2 items-center">
      <NumberInput
        initialValue={defaultValue}
        onSubmit={onConfirm}
        onCancel={onCancel}
        enableArrowNudge={false}
        showConfirmButton
        className="contents"
        inputClassName="w-20 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        confirmButtonClassName="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
      />
      <span className="text-gray-400 text-sm">
        {UNIT[constraintType] ?? ""}
      </span>
      <button
        onClick={onCancel}
        className="px-2 py-1 bg-gray-500 hover:bg-gray-400 rounded text-sm"
      >
        Cancel
      </button>
    </div>
    <div className="text-xs text-gray-400 mt-1">
      Enter to confirm, Escape to cancel
    </div>
  </div>
);

export default ValueInputModal;
