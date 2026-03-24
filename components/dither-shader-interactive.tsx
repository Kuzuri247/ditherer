"use client";
import { DitherShader } from "@/components/ui/dither-shader";
import React, { useState, useRef, useDeferredValue } from "react";
import { Download, RotateCcw, Upload, Video } from "lucide-react";

export default function DitherShaderInteractive() {
  const [ditherMode, setDitherMode] = useState<
    "bayer" | "halftone" | "noise" | "crosshatch"
  >("noise");
  const [colorMode, setColorMode] = useState<
    "original" | "grayscale" | "duotone" | "custom"
  >("grayscale");
  const [gridSize, setGridSize] = useState(3);
  const [invert, setInvert] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [primaryColor, setPrimaryColor] = useState("#0a0a0a");
  const [secondaryColor, setSecondaryColor] = useState("#fafafa");
  const [imageSrc, setImageSrc] = useState("/test.jpg");
  const [isRecording, setIsRecording] = useState(false);

  const deferredGridSize = useDeferredValue(gridSize);
  const deferredThreshold = useDeferredValue(threshold);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `dither-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleRecord = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    // @ts-ignore - captureStream is valid on HTMLCanvasElement but TS might complain depending on DOM lib
    if (!canvas || isRecording || !canvas.captureStream) return;

    // Automatically turn on animation if they intend to record a video!
    if (!animated) setAnimated(true);

    setIsRecording(true);

    // Grab a 30 FPS stream from the canvas
    // @ts-ignore
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `dither-animation-${Date.now()}.webm`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
    };

    mediaRecorder.start();

    // Automatically stop after 3 seconds
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 5000);
  };

  return (
    <div className="flex flex-row max-sm:flex-col items-center gap-8 max-sm:gap-4 ">
      {/* Canvas - responsive sizing via Tailwind */}
      <div ref={containerRef} className="flex items-center relative w-2/3 px-4 overflow-hidden rounded-xl border border-neutral-200 shadow-xl dark:border-neutral-800">
        <DitherShader
          src={imageSrc}
          gridSize={deferredGridSize}
          ditherMode={ditherMode}
          colorMode={colorMode}
          invert={invert}
          animated={animated}
          animationSpeed={0.025}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          threshold={deferredThreshold}
          className="max-sm:h-[250px] max-sm:w-[350px] sm:h-[350px] sm:w-[500px] md:h-[500px] md:w-[600px]"
        />
      </div>

      {/* Controls Panel */}
      <div className="w-1/3 max-w-lg  rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">

        <div className="flex justify-between" >
          <h1 className="text-2xl font-bold pb-4">Dither Shader</h1>
          <button
            onClick={() => {
              setDitherMode("noise");
              setColorMode("grayscale");
              setGridSize(3);
              setInvert(false);
              setAnimated(false);
              setThreshold(0.5);
              setPrimaryColor("#0a0a0a");
              setSecondaryColor("#fafafa");
              setImageSrc("/test.jpg");
            }}
            className="pb-3 text-neutral-700 transition-all dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          {/* Dither Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Pattern
            </label>
            <select
              value={ditherMode}
              onChange={(e) =>
                setDitherMode(
                  e.target.value as
                  | "bayer"
                  | "halftone"
                  | "noise"
                  | "crosshatch",
                )
              }
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-900 transition-colors outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="noise">Noise</option>
              <option value="bayer">Bayer</option>
              <option value="halftone">Halftone</option>
              <option value="crosshatch">Crosshatch</option>
            </select>
          </div>

          {/* Color Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Colors
            </label>
            <select
              value={colorMode}
              onChange={(e) =>
                setColorMode(
                  e.target.value as
                  | "original"
                  | "grayscale"
                  | "duotone"
                  | "custom",
                )
              }
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-900 transition-colors outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="grayscale">Grayscale</option>
              <option value="original">Original</option>
              <option value="duotone">Duotone</option>
            </select>
          </div>

          {/* Grid Size */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Size: {gridSize}px
            </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-white"
            />
          </div>

          {/* Threshold */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-white"
            />
          </div>

          {/* Duotone Colors - only show when duotone is selected */}
          {colorMode === "duotone" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Dark Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span className="font-mono text-xs text-neutral-500">
                    {primaryColor}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Light Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span className="font-mono text-xs text-neutral-500">
                    {secondaryColor}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toggle Buttons Row */}
        <div className="mt-4 flex  gap-2">
          <button
            onClick={() => setInvert(!invert)}
            className={`rounded-full  py-1.5 text-xs font-medium transition-all duration-300 ${invert
              ? "bg-neutral-900 px-2 text-white dark:bg-white dark:text-black"
              : "bg-neutral-200 px-4 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
          >
            {invert ? "Inverted" : "Invert"}
          </button>
          <button
            onClick={() => setAnimated(!animated)}
            disabled={ditherMode !== "noise"}
            title={ditherMode !== "noise" ? "Only available when Noise pattern is selected" : ""}
            className={`rounded-full py-1.5 text-xs font-medium transition-all duration-300 ${
              ditherMode !== "noise"
                ? "bg-neutral-300 px-4 text-neutral-400 dark:bg-neutral-900/50 dark:text-neutral-600 cursor-not-allowed opacity-60"
                : animated
                  ? "bg-neutral-900 px-2 text-white dark:bg-white dark:text-black"
                  : "bg-neutral-200 px-4 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
          >
            {animated ? "Animating" : "Animate"}
          </button>

          <div className="relative flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Upload Image"
            />
            <button className="flex items-center gap-2 rounded-full bg-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
              <Upload size={16} />
            </button>
          </div>

          <button
            onClick={handleRecord}
            disabled={isRecording || ditherMode !== "noise"}
            title={
              ditherMode !== "noise"
                ? "Only available when Noise pattern is selected"
                : isRecording ? "Recording 5s video..." : "Record 5s Video"
            }
            className={`flex items-center justify-center rounded-full px-2 py-1.5 text-xs font-medium transition-all 
              ${ditherMode !== "noise"
                ? "bg-neutral-300 text-neutral-400 dark:bg-neutral-900/50 dark:text-neutral-600 cursor-not-allowed opacity-60"
                : isRecording
                  ? "bg-red-500 text-white animate-pulse cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"}`}
          >
            <Video size={16} />
          </button>

          <button
            onClick={handleDownload}
            title="Download Image"
            className="flex items-center justify-center rounded-full bg-blue-500 px-2 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
