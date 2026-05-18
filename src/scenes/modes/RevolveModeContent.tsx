import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCadVisualizer, useRevolveMode } from "@vitekk02/cadjs/react";
import RevolveModePanel from "../../navbar/RevolveModePanel";
import type { ModeContentProps } from ".";

const RevolveModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { renderer } = useCadVisualizer();
  const {
    phase,
    isApplying,
    angle,
    angle2,
    direction,
    setAngle,
    setAngle2,
    setDirection,
    flipAxis,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleKeyDown,
    performRevolve,
    selectOriginAxis,
  } = useRevolveMode();

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
    <RevolveModePanel
      revolveIsApplying={isApplying}
      revolvePhase={phase}
      selectOriginAxis={selectOriginAxis}
      revolveDirection={direction}
      setRevolveDirection={setDirection}
      flipRevolveAxis={flipAxis}
      revolveAngle={angle}
      setRevolveAngle={setAngle}
      revolveAngle2={angle2}
      setRevolveAngle2={setAngle2}
      performRevolve={performRevolve}
    />,
    panelSlot,
  );
};

export default RevolveModeContent;
