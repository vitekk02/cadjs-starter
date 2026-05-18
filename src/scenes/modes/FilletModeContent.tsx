import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCadVisualizer, useFilletMode } from "@vitekk02/cadjs/react";
import FilletModePanel from "../../navbar/FilletModePanel";
import DimensionInput from "../../components/DimensionInput";
import type { ModeContentProps } from ".";

const FilletModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { renderer } = useCadVisualizer();
  const {
    selectedElement,
    selectedEdgeIndices,
    radius,
    operationType,
    isApplying,
    showDimensionInput,
    dimensionInputPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleKeyDown,
    handleRadiusSubmit,
    handleRadiusCancel,
    toggleOperationType,
  } = useFilletMode();

  useEffect(() => {
    if (!renderer) return;
    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    dom.addEventListener("mousemove", handleMouseMove);
    dom.addEventListener("mouseup", handleMouseUp);
    dom.addEventListener("contextmenu", handleContextMenu);
    return () => {
      dom.removeEventListener("mousedown", handleMouseDown);
      dom.removeEventListener("mousemove", handleMouseMove);
      dom.removeEventListener("mouseup", handleMouseUp);
      dom.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    renderer,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {panelSlot &&
        createPortal(
          <FilletModePanel
            filletOpType={operationType}
            toggleFilletOpType={toggleOperationType}
            filletIsApplying={isApplying}
            filletSelectedElement={selectedElement}
            filletSelectedEdges={selectedEdgeIndices}
            filletRadius={radius}
          />,
          panelSlot,
        )}

      {showDimensionInput && (
        <DimensionInput
          visible={showDimensionInput}
          position={dimensionInputPosition}
          label={
            operationType === "fillet" ? "Fillet Radius" : "Chamfer Distance"
          }
          initialValue={radius}
          onSubmit={handleRadiusSubmit}
          onCancel={handleRadiusCancel}
        />
      )}
    </>
  );
};

export default FilletModeContent;
