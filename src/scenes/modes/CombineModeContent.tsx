import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCadVisualizer, useCombineMode } from "@vitekk02/cadjs/react";
import CombineModePanel from "../../navbar/CombineModePanel";
import type { ModeContentProps } from ".";

const CombineModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { renderer } = useCadVisualizer();
  const {
    handleCombineMouseDown,
    handleCombineMouseMove,
    handleCombineMouseUp,
    handleCombineContextMenu,
    performCombine,
    canCombine,
    operationType,
    setOperationType,
    targetBody,
    toolBodies,
    keepTools,
    setKeepTools,
  } = useCombineMode();

  useEffect(() => {
    if (!renderer) return;
    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleCombineMouseDown);
    dom.addEventListener("mousemove", handleCombineMouseMove);
    dom.addEventListener("mouseup", handleCombineMouseUp);
    dom.addEventListener("contextmenu", handleCombineContextMenu);
    return () => {
      dom.removeEventListener("mousedown", handleCombineMouseDown);
      dom.removeEventListener("mousemove", handleCombineMouseMove);
      dom.removeEventListener("mouseup", handleCombineMouseUp);
      dom.removeEventListener("contextmenu", handleCombineContextMenu);
    };
  }, [
    renderer,
    handleCombineMouseDown,
    handleCombineMouseMove,
    handleCombineMouseUp,
    handleCombineContextMenu,
  ]);

  if (!panelSlot) return null;
  return createPortal(
    <CombineModePanel
      combineOpType={operationType}
      setCombineOpType={setOperationType}
      combineTarget={targetBody}
      combineTools={toolBodies}
      combineKeepTools={keepTools}
      setCombineKeepTools={setKeepTools}
      canCombine={canCombine}
      performCombine={performCombine}
    />,
    panelSlot,
  );
};

export default CombineModeContent;
