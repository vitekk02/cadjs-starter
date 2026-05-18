import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useCadCore,
  useCadVisualizer,
  useExtrudeMode,
} from "@vitekk02/cadjs/react";
import ExtrudeModePanel from "../../navbar/ExtrudeModePanel";
import DimensionInput from "../../components/DimensionInput";
import type { ModeContentProps } from ".";

const ExtrudeModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { elements } = useCadCore();
  const { renderer } = useCadVisualizer();
  const {
    selectedElements,
    isExtruding,
    extrusionDepth,
    activeDirection,
    showDimensionInput,
    dimensionInputPosition,
    operationType,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleDimensionSubmit,
    handleDimensionCancel,
    handleDimensionChange,
    toggleOperationType,
    dimSceneBodies,
  } = useExtrudeMode();

  useEffect(() => {
    if (!renderer) return;
    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    dom.addEventListener("mousemove", handleMouseMove);
    dom.addEventListener("mouseup", handleMouseUp);
    return () => {
      dom.removeEventListener("mousedown", handleMouseDown);
      dom.removeEventListener("mousemove", handleMouseMove);
      dom.removeEventListener("mouseup", handleMouseUp);
    };
  }, [renderer, handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Dim 3D bodies on entry and re-dim when elements change.
  useEffect(() => {
    dimSceneBodies();
  }, [elements, dimSceneBodies]);

  return (
    <>
      {panelSlot &&
        createPortal(
          <ExtrudeModePanel
            extrudeOpType={operationType}
            toggleExtrudeOpType={toggleOperationType}
            extrudeSelectedElements={selectedElements}
            isExtruding={isExtruding}
            extrusionDepth={extrusionDepth}
            extrudeDirection={activeDirection}
            showExtrudeDimensionInput={showDimensionInput}
          />,
          panelSlot,
        )}

      {showDimensionInput && (
        <DimensionInput
          visible={showDimensionInput}
          position={dimensionInputPosition}
          label="Extrusion Depth"
          initialValue={extrusionDepth > 0 ? extrusionDepth : 1}
          externalValue={isExtruding ? extrusionDepth : undefined}
          onSubmit={handleDimensionSubmit}
          onCancel={handleDimensionCancel}
          onChange={handleDimensionChange}
          showConfirmButton
        />
      )}
    </>
  );
};

export default ExtrudeModeContent;
