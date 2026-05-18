import { FC, useEffect } from "react";
import { useCadVisualizer, useMoveMode } from "@vitekk02/cadjs/react";
import type { ModeContentProps } from ".";

const MoveModeContent: FC<ModeContentProps> = ({ setMoveSelectedObject }) => {
  const { renderer } = useCadVisualizer();
  const [
    { selectedObject },
    { handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu },
  ] = useMoveMode();

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

  // Publish gizmo target to chrome status bar.
  useEffect(() => {
    setMoveSelectedObject(selectedObject);
  }, [selectedObject, setMoveSelectedObject]);
  useEffect(() => {
    return () => setMoveSelectedObject(null);
  }, [setMoveSelectedObject]);

  return null;
};

export default MoveModeContent;
