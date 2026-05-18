import React, { useEffect, useState } from "react";
import { Sketch, SketchPrimitive } from "@vitekk02/cadjs";
import SketchPropertiesPanel from "./SketchPropertiesPanel";

interface SketchPropertiesSidePanelProps {
  activeSketch: Sketch;
  selectedPrimitives: string[];
  onUpdatePoint: (
    updates: Map<string, { x: number; y: number }>,
  ) => Promise<void>;
  onUpdatePrimitiveProperty: (
    primitiveId: string,
    updates: Partial<SketchPrimitive>,
  ) => Promise<void>;
}

const matchesLg = (): boolean =>
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 1024px)").matches
    : true;

export const SketchPropertiesSidePanel: React.FC<
  SketchPropertiesSidePanelProps
> = ({
  activeSketch,
  selectedPrimitives,
  onUpdatePoint,
  onUpdatePrimitiveProperty,
}) => {
  const [open, setOpen] = useState(matchesLg);

  useEffect(() => {
    const lgQuery = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setOpen(e.matches);
    lgQuery.addEventListener("change", handler);
    return () => lgQuery.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {!open && (
        <button
          className="lg:hidden fixed top-14 right-2 z-40 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 shadow-lg"
          onClick={() => setOpen(true)}
          title="Show Properties"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      )}

      {open && (
        <div className="flex-none w-60 bg-gray-800 bg-opacity-90 border-l border-gray-700 overflow-hidden max-lg:absolute max-lg:right-0 max-lg:z-30 max-lg:h-full max-lg:shadow-xl">
          <button
            className="lg:hidden w-full flex items-center justify-start px-2 py-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            onClick={() => setOpen(false)}
            title="Close Properties"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <SketchPropertiesPanel
            activeSketch={activeSketch}
            selectedPrimitives={selectedPrimitives}
            onUpdatePoint={onUpdatePoint}
            onUpdatePrimitiveProperty={onUpdatePrimitiveProperty}
          />
        </div>
      )}
    </>
  );
};
