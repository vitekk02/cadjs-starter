import React from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SceneMode } from "@vitekk02/cadjs";
import SelectOtherMenu from "./SelectOtherMenu";
import NavigationBar from "./NavigationBar";
import ModeInfoCard from "./ModeInfoCard";

/** Mode-agnostic floating UI: select-other picker, navigation bar, mode info
 *  card. Mode-specific overlays (sketch context menu, plane-selection hint,
 *  dimension inputs) live in their respective `*ModeContent` components. */

// PickItem is opaque to this component — passed through to SelectOtherMenu.
interface SelectOtherMenuState {
  x: number;
  y: number;
  items: unknown[];
  onHover?: (item: unknown | null) => void;
  onPick: (item: unknown) => void;
  onCancel?: () => void;
}

interface SceneOverlaysProps {
  mode: SceneMode;

  // Select Other menu
  selectOtherMenu: SelectOtherMenuState | null;
  setSelectOtherMenu: (v: SelectOtherMenuState | null) => void;

  // Plane-selection state — kept here only because ModeInfoCard needs it.
  isSelectingPlane: boolean;

  // Navigation + mode info
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  navToolActiveRef: React.MutableRefObject<boolean>;
  onFitAll: () => void;
  activeSketch: boolean;
}

export const SceneOverlays: React.FC<SceneOverlaysProps> = ({
  mode,
  selectOtherMenu,
  setSelectOtherMenu,
  isSelectingPlane,
  controlsRef,
  navToolActiveRef,
  onFitAll,
  activeSketch,
}) => {
  return (
    <>
      <SelectOtherMenu
        visible={selectOtherMenu !== null}
        x={selectOtherMenu?.x ?? 0}
        y={selectOtherMenu?.y ?? 0}
        items={selectOtherMenu?.items ?? []}
        onHover={selectOtherMenu?.onHover}
        onPick={(item) => {
          selectOtherMenu?.onPick(item);
          setSelectOtherMenu(null);
        }}
        onClose={() => {
          selectOtherMenu?.onCancel?.();
          setSelectOtherMenu(null);
        }}
      />

      <NavigationBar
        controlsRef={controlsRef}
        navToolActiveRef={navToolActiveRef}
        onFitAll={onFitAll}
      />

      <ModeInfoCard
        mode={mode}
        isSelectingPlane={isSelectingPlane}
        activeSketch={activeSketch}
      />
    </>
  );
};
