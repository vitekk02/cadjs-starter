import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCadVisualizer, useLoftMode } from "@vitekk02/cadjs/react";
import LoftModePanel from "../../navbar/LoftModePanel";
import type { ModeContentProps } from ".";

const LoftModeContent: FC<ModeContentProps> = ({ panelSlot }) => {
  const { renderer } = useCadVisualizer();
  const {
    selectedProfiles,
    isApplying,
    isRuled,
    setIsRuled,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleKeyDown,
    performLoft,
    canLoft,
  } = useLoftMode();

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
    <LoftModePanel
      loftIsRuled={isRuled}
      setLoftIsRuled={setIsRuled}
      loftIsApplying={isApplying}
      loftSelectedProfiles={selectedProfiles}
      canLoft={canLoft}
      performLoft={performLoft}
    />,
    panelSlot,
  );
};

export default LoftModeContent;
