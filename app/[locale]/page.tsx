"use client";
import React from "react";
import { LeftResourcePanel } from "./LeftResourcePanel";
import { RightPropertyPanel } from "./RightPropertyPanel";
import { ImageEditor } from "./ImageEditor";
import { ImageEditorToolbar } from "./ImageEditorToolbar";
import { PicproseProvider } from "./PicproseContext";
import { ComponentToImg, type ComponentToImgHandle, type ExportFormat } from "./ComponentToImg";
import { useHistory } from "./useHistory";
import { createInitialElements, type EditorElements } from "./types";

export default function Home() {
  const [selectedImage, setSelectedImage] = React.useState({});

  // Lift all state to the top-level component
  const [isDragMode, setIsDragMode] = React.useState(false);
  const [elements, setElements] = React.useState(createInitialElements);

  // 撤销 / 重做。快照和索引在 hook 内部是同一份 state，不会各自漂移。
  const initialElements = React.useMemo(createInitialElements, []);
  const history = useHistory(initialElements, setElements);

  // Add reference to ComponentToImg
  const componentToImgRef = React.useRef<ComponentToImgHandle>(null);

  // Modify image download method
  const handleDownload = (format: ExportFormat) => {
    // Call ComponentToImg download method
    componentToImgRef.current?.downloadImage(format);
  };

  // Reset all editor state
  const handleResetLayout = () => {
    const resetElements = createInitialElements();
    setElements(resetElements);
    history.reset(resetElements);
    setIsDragMode(false);
  };

  // Save history
  const saveHistory = (currentElements: EditorElements) => {
    history.push(currentElements);
  };

  return (
    <PicproseProvider onDownload={handleDownload}>
      <div className="flex flex-col lg:flex-row h-screen max-h-screen">
        {/* Left panel - fixed width 350px */}
        <div className="lg:w-[350px] flex-shrink-0 h-screen overflow-hidden">
          <LeftResourcePanel />
        </div>

        {/* Middle content area - adaptive fill remaining space */}
        <div className="flex-grow flex flex-col bg-pp-canvas h-screen max-h-screen overflow-hidden relative">
          <div className="flex-1 flex justify-center items-center bg-surface-secondary">
            <ComponentToImg ref={componentToImgRef}>
              <ImageEditor
                isDragMode={isDragMode}
                elements={elements}
                setElements={setElements}
                saveHistory={saveHistory}
                handleResetLayout={handleResetLayout}
              />
            </ComponentToImg>
          </div>

          {/* Toolbar floating above */}
          <ImageEditorToolbar
            isDragMode={isDragMode}
            setIsDragMode={setIsDragMode}
            handleResetLayout={handleResetLayout}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={history.undo}
            onRedo={history.redo}
          />
        </div>

        {/* Right panel - fixed width 350px */}
        <div className="lg:w-[350px] flex-shrink-0 h-screen overflow-hidden">
          <RightPropertyPanel />
        </div>
      </div>
    </PicproseProvider>
  );
}
