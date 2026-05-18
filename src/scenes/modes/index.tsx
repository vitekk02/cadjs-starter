import type { ComponentType, MutableRefObject } from "react";
import type * as THREE from "three";
import type { SceneMode } from "@vitekk02/cadjs";
import CombineModeContent from "./CombineModeContent";
import ExtrudeModeContent from "./ExtrudeModeContent";
import FilletModeContent from "./FilletModeContent";
import LoftModeContent from "./LoftModeContent";
import MeasureModeContent from "./MeasureModeContent";
import MoveModeContent from "./MoveModeContent";
import RevolveModeContent from "./RevolveModeContent";
import SketchModeContent from "./SketchModeContent";
import SweepModeContent from "./SweepModeContent";

export interface ModeContentProps {
  /** DOM node that ModeContent should portal its mode-specific toolbar panel
   *  into. Owned by the scene's secondary toolbar; null when no secondary
   *  bar is rendered (e.g. move mode). */
  panelSlot: HTMLDivElement | null;
  /** Move mode publishes its gizmo target to the status bar. Other modes
   *  ignore this. */
  setMoveSelectedObject: (id: string | null) => void;
  /** Sketch mode publishes its plane-selection state to the chrome so the
   *  scene can gate the secondary toolbar. Other modes ignore this. */
  setSketchIsSelectingPlane: (v: boolean) => void;
  /** Sketch mode hides origin helpers during plane selection. */
  originGroupRef: MutableRefObject<THREE.Group | null>;
  /** Counter incremented by chrome's "New Sketch" button. SketchModeContent
   *  watches it and enters plane-selection mode on each tick. */
  sketchStartCounter: number;
  /** Sketch publishes its primitive selection so the right-side
   *  SketchPropertiesPanel (chrome) can read it without calling useSketchMode. */
  setSketchSelectedPrimitives: (ids: string[]) => void;
}

export const MODE_COMPONENTS: Partial<
  Record<SceneMode, ComponentType<ModeContentProps>>
> = {
  combine: CombineModeContent,
  extrude: ExtrudeModeContent,
  fillet: FilletModeContent,
  loft: LoftModeContent,
  measure: MeasureModeContent,
  move: MoveModeContent,
  revolve: RevolveModeContent,
  sketch: SketchModeContent,
  sweep: SweepModeContent,
};
