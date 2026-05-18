import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCadVisualizer, useSweepMode } from "@vitekk02/cadjs/react";
import SweepModePanel from "../../navbar/SweepModePanel";
import type { ModeContentProps } from ".";

const SweepModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { renderer } = useCadVisualizer();
  const {
    phase,
    isApplying,
    orientation,
    cornerMode,
    setOrientation,
    setCornerMode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleKeyDown,
    performSweep,
    canSweep,
  } = useSweepMode();

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

  if (!panelSlot) return null;
  return createPortal(
    <SweepModePanel
      sweepOrientation={orientation}
      setSweepOrientation={setOrientation}
      sweepCornerMode={cornerMode}
      setSweepCornerMode={setCornerMode}
      sweepIsApplying={isApplying}
      sweepPhase={phase}
      canSweep={canSweep}
      performSweep={performSweep}
    />,
    panelSlot,
  );
};

export default SweepModeContent;
