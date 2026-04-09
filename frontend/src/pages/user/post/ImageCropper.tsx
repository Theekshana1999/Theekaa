import React, { useState, useRef, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Crop } from "lucide-react";

const ASPECT = 3 / 4;

interface CropperProps {
  src: string;
  onDone: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<CropperProps> = ({ src, onDone, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const BOX_W = 270;
  const BOX_H = BOX_W / ASPECT; // 360

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const [imgNaturalW, setImgNaturalW] = useState(1);
  const [imgNaturalH, setImgNaturalH] = useState(1);

  const clamp = useCallback(
    (raw: { x: number; y: number }, z: number) => {
      // Preview uses "cover" scale; match that here
      const baseScale = Math.max(BOX_W / imgNaturalW, BOX_H / imgNaturalH);
      const scale = baseScale * z;

      const dw = imgNaturalW * scale;
      const dh = imgNaturalH * scale;

      // If image is smaller than box (rare with cover, but safe), don't allow negative max
      const maxX = Math.max(0, (dw - BOX_W) / 2);
      const maxY = Math.max(0, (dh - BOX_H) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, raw.x)),
        y: Math.min(maxY, Math.max(-maxY, raw.y)),
      };
    },
    [imgNaturalW, imgNaturalH, BOX_W, BOX_H]
  );

  const onLoad = () => {
    const img = imgRef.current!;
    setImgNaturalW(img.naturalWidth);
    setImgNaturalH(img.naturalHeight);

    // reset
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset(
      clamp(
        {
          x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
          y: dragStart.current.oy + (e.clientY - dragStart.current.my),
        },
        zoom
      )
    );
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset(
      clamp(
        {
          x: dragStart.current.ox + (t.clientX - dragStart.current.mx),
          y: dragStart.current.oy + (t.clientY - dragStart.current.my),
        },
        zoom
      )
    );
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(4, Math.max(1, zoom + delta));
    setZoom(next);
    setOffset((prev) => clamp(prev, next));
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleCrop = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = imgRef.current!;

    // output size (2x for sharper export)
    const OUT_W = Math.round(BOX_W * 2);
    const OUT_H = Math.round(BOX_H * 2);
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    // MUST match preview (cover)
    const baseScale = Math.max(BOX_W / imgNaturalW, BOX_H / imgNaturalH);
    const scale = baseScale * zoom;

    // rendered (preview) image size
    const renderedW = imgNaturalW * scale;
    const renderedH = imgNaturalH * scale;

    // top-left of the rendered image inside the BOX (preview coords)
    const imgLeft = BOX_W / 2 + offset.x - renderedW / 2;
    const imgTop = BOX_H / 2 + offset.y - renderedH / 2;

    // Map BOX rect (0..BOX_W, 0..BOX_H) back to source image pixels
    let sx = (0 - imgLeft) / scale;
    let sy = (0 - imgTop) / scale;
    let sWidth = BOX_W / scale;
    let sHeight = BOX_H / scale;

    // Clamp to image bounds (avoids black edges)
    if (sx < 0) {
      sWidth += sx;
      sx = 0;
    }
    if (sy < 0) {
      sHeight += sy;
      sy = 0;
    }
    if (sx + sWidth > imgNaturalW) sWidth = imgNaturalW - sx;
    if (sy + sHeight > imgNaturalH) sHeight = imgNaturalH - sy;

    ctx.clearRect(0, 0, OUT_W, OUT_H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, OUT_W, OUT_H);
    onDone(canvas.toDataURL("image/jpeg", 0.92));
  };

  // Preview render sizing (cover)
  const baseScale =
    imgNaturalW && imgNaturalH ? Math.max(BOX_W / imgNaturalW, BOX_H / imgNaturalH) : 1;

  const renderedW = imgNaturalW * baseScale * zoom;
  const renderedH = imgNaturalH * baseScale * zoom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-100 to-violet-100">
              <Crop size={16} className="text-fuchsia-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Crop Photo</h3>
              <p className="text-[11px] text-gray-400">3:4 portrait · drag to reposition</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Crop viewport */}
        <div className="flex justify-center">
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-fuchsia-300 shadow-lg cursor-grab active:cursor-grabbing select-none"
            style={{ width: BOX_W, height: BOX_H }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop"
              onLoad={onLoad}
              draggable={false}
              style={{
                position: "absolute",
                width: renderedW,
                height: renderedH,
                left: `calc(50% + ${offset.x}px)`,
                top: `calc(50% + ${offset.y}px)`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />

            {/* Rule-of-thirds grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right,  rgba(255,255,255,.18) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,.18) 1px, transparent 1px)
                `,
                backgroundSize: `${BOX_W / 3}px ${BOX_H / 3}px`,
              }}
            />

            {/* Corner accents */}
            {[
              "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl",
              "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl",
              "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl",
              "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 border-fuchsia-400 ${cls}`} />
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeZoom(-0.2)}
            className="p-2 rounded-xl border border-gray-200 hover:border-fuchsia-300 hover:bg-fuchsia-50 transition text-gray-500 hover:text-fuchsia-600"
          >
            <ZoomOut size={15} />
          </button>

          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => {
              const z = parseFloat(e.target.value);
              setZoom(z);
              setOffset((prev) => clamp(prev, z));
            }}
            className="flex-1 accent-fuchsia-500 h-1.5 rounded-full cursor-pointer"
          />

          <button
            type="button"
            onClick={() => changeZoom(0.2)}
            className="p-2 rounded-xl border border-gray-200 hover:border-fuchsia-300 hover:bg-fuchsia-50 transition text-gray-500 hover:text-fuchsia-600"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition text-gray-500 hover:text-rose-500"
            title="Reset"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 -mt-3">
          {Math.round(zoom * 100)}% zoom
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 hover:opacity-90 transition shadow-md shadow-fuchsia-200"
          >
            Apply Crop
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageCropper;