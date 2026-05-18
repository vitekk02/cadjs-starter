import React, { useEffect, useState } from "react";
import { BrowserSection } from "@vitekk02/cadjs";
import BrowserPanel from "./FeatureTree";

interface BrowserSidePanelProps {
  sections: BrowserSection[];
  selectedElementId: string | undefined;
  onSelectNode: (elementId: string) => void;
  onToggleVisibility: (nodeId: string) => void;
  onToggleSectionExpanded: (sectionId: string) => void;
  onToggleItemExpanded: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onEditSketch: (sketchId: string) => void;
}

const matchesLg = (): boolean =>
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 1024px)").matches
    : true;

export const BrowserSidePanel: React.FC<BrowserSidePanelProps> = ({
  sections,
  selectedElementId,
  onSelectNode,
  onToggleVisibility,
  onToggleSectionExpanded,
  onToggleItemExpanded,
  onRenameNode,
  onDeleteNode,
  onEditSketch,
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
          className="fixed top-28 left-2 z-40 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 shadow-lg"
          onClick={() => setOpen(true)}
          title="Show Browser"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {open && (
        <div className="flex-none w-56 bg-gray-800 bg-opacity-90 border-r border-gray-700 overflow-hidden max-lg:absolute max-lg:z-30 max-lg:h-full max-lg:shadow-xl">
          <button
            className="w-full flex items-center justify-end px-2 py-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 lg:border-b lg:border-gray-700"
            onClick={() => setOpen(false)}
            title="Collapse Browser"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <BrowserPanel
            sections={sections}
            selectedElementId={selectedElementId}
            onSelectNode={onSelectNode}
            onToggleVisibility={onToggleVisibility}
            onToggleSectionExpanded={onToggleSectionExpanded}
            onToggleItemExpanded={onToggleItemExpanded}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
            onEditSketch={onEditSketch}
          />
        </div>
      )}
    </>
  );
};
