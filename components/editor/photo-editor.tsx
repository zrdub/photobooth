"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Heart, Home, Image as ImageIcon, Loader2, RotateCcw, Sparkles, Trash2, Upload, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FramePreview } from "@/components/editor/frame-preview";
import { StripCanvas } from "@/components/editor/strip-canvas";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import studioBackgroundData from "@/data/studio-backgrounds.json";
import { replacePhotoBackground, type StudioBackground } from "@/lib/ai-background";
import { downloadDataUrl } from "@/lib/utils";
import { allFrames, FrameCategory, stickerAssets, useBoothStore } from "@/store/booth-store";

const categories: Array<FrameCategory | "All"> = ["All", "Pastel", "Minimal", "Korean", "Vintage", "Y2K", "Love", "Cute", "Gradient", "Glass", "Polaroid"];

export function PhotoEditor() {
  const exportRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [processedPhotos, setProcessedPhotos] = useState<string[]>([]);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [canvasScale, setCanvasScale] = useState(0.45);
  const {
    photos,
    selectedFrameId,
    photoCount,
    orientation,
    activeCategory,
    stickers,
    selectedStickerId,
    aiBackgroundEnabled,
    selectedStudioBackgroundId,
    setSelectedFrameId,
    setPhotoCount,
    setOrientation,
    setActiveCategory,
    setAiBackgroundEnabled,
    setSelectedStudioBackgroundId,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
    setSelectedStickerId,
    setStep,
    setPhotos,
    resetPhotos,
  } = useBoothStore();

  const selectedFrame = useMemo(() => allFrames.find((frame) => frame.id === selectedFrameId) ?? allFrames[0], [selectedFrameId]);
  const visibleFrames = useMemo(() => allFrames.filter((frame) => activeCategory === "All" || frame.category === activeCategory), [activeCategory]);
  const selectedSticker = useMemo(() => stickers.find((sticker) => sticker.id === selectedStickerId), [selectedStickerId, stickers]);
  const studioBackgrounds = studioBackgroundData as StudioBackground[];
  const selectedStudioBackground = useMemo(
    () => studioBackgrounds.find((background) => background.id === selectedStudioBackgroundId) ?? studioBackgrounds[1],
    [selectedStudioBackgroundId, studioBackgrounds],
  );
  const renderPhotos = aiBackgroundEnabled && processedPhotos.length === photos.length ? processedPhotos : photos;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = () => {
      const { width: previewWidth, height: previewHeight } = preview.getBoundingClientRect();
      const stripWidth = orientation === "vertical" ? 420 : 1260;
      const stripHeight = orientation === "vertical" ? 1260 : 420;
      const desktopLimit = orientation === "vertical" ? 0.45 : 0.46;
      const availableWidth = Math.max(previewWidth - 28, 1);
      const availableHeight = Math.max(previewHeight - 28, 1);
      const nextScale = Math.min(desktopLimit, availableWidth / stripWidth, availableHeight / stripHeight);

      setCanvasScale(Math.max(nextScale, 0.2));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(preview);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", updateScale);
    };
  }, [orientation]);

  useEffect(() => {
    let cancelled = false;

    async function processPhotos() {
      if (!aiBackgroundEnabled || photos.length === 0) {
        setProcessedPhotos([]);
        setIsProcessingBackground(false);
        return;
      }

      setIsProcessingBackground(true);
      try {
        const nextPhotos: string[] = [];
        for (const photo of photos) {
          if (cancelled) return;
          nextPhotos.push(await replacePhotoBackground(photo, selectedStudioBackground));
        }
        if (!cancelled) {
          setProcessedPhotos(nextPhotos);
          toast.success("AI background applied.");
        }
      } catch {
        if (!cancelled) {
          setProcessedPhotos([]);
          setAiBackgroundEnabled(false);
          toast.error("AI background failed. Using original photos.");
        }
      } finally {
        if (!cancelled) setIsProcessingBackground(false);
      }
    }

    processPhotos();

    return () => {
      cancelled = true;
    };
  }, [aiBackgroundEnabled, photos, selectedStudioBackground, setAiBackgroundEnabled]);

  async function exportStrip() {
    if (!exportRef.current) return;
    if (isProcessingBackground) {
      toast.error("Please wait until AI background is ready.");
      return;
    }

    setSelectedStickerId(null);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    });
    downloadDataUrl(canvas.toDataURL("image/png"), "pinky-booth-strip.png");
    toast.success("Strip downloaded.");
  }

  async function importPhotos(files: FileList | null) {
    const imageFiles = Array.from(files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6);

    if (imageFiles.length === 0) return;

    const nextPhotos = await Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Could not read image."));
            reader.readAsDataURL(file);
          }),
      ),
    );

    setPhotos(nextPhotos);
    setPhotoCount(nextPhotos.length <= 2 ? 2 : nextPhotos.length <= 4 ? 4 : 6);
    toast.success(`${nextPhotos.length} photo${nextPhotos.length > 1 ? "s" : ""} imported.`);
    if (uploadRef.current) uploadRef.current.value = "";
  }

  return (
    <section className="min-h-dvh px-3 py-3 sm:px-5 sm:py-5 xl:h-dvh xl:overflow-hidden xl:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-7xl gap-3 sm:gap-5 xl:h-full xl:min-h-0 xl:grid-cols-[440px_1fr]">
        <aside className="glass-panel order-2 flex min-h-0 flex-col overflow-visible rounded-booth p-4 sm:p-5 xl:order-1 xl:overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-petal">Editor</p>
              <h2 className="mt-2 text-3xl font-black text-ink">Make it yours</h2>
            </div>
            <Button variant="ghost" className="size-11 px-0" aria-label="Home" onClick={() => setStep("landing")}>
              <Home className="size-5" />
            </Button>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-visible pr-0 xl:mt-6 xl:overflow-y-auto xl:pr-1">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:gap-4">
            <SegmentedControl
              label="Photos"
              value={String(photoCount)}
              options={[
                { value: "2", label: "2" },
                { value: "4", label: "4" },
                { value: "6", label: "6" },
              ]}
              onChange={(value) => setPhotoCount(Number(value) as 2 | 4 | 6)}
            />
            <SegmentedControl
              label="Layout"
              value={orientation}
              options={[
                { value: "vertical", label: "Vertical" },
                { value: "horizontal", label: "Horizontal" },
              ]}
              onChange={setOrientation}
            />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                importPhotos(event.target.files).catch(() => toast.error("Could not import photos."));
              }}
            />
            <Button variant="secondary" icon={<Upload className="size-5" />} onClick={() => uploadRef.current?.click()}>
              Choose Photos
            </Button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">AI studio background</p>
              {isProcessingBackground ? <Loader2 className="size-4 animate-spin text-petal" /> : null}
            </div>
            <button
              type="button"
              onClick={() => setAiBackgroundEnabled(!aiBackgroundEnabled)}
              className={`mt-3 flex w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left text-sm font-bold transition ${
                aiBackgroundEnabled ? "border-petal bg-white text-ink shadow-button" : "border-white/70 bg-white/45 text-ink/62 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <Wand2 className="size-4 text-petal" />
                Remove background otomatis
              </span>
              <span className="rounded-full bg-white/75 px-3 py-1 text-xs text-ink/55">{aiBackgroundEnabled ? "On" : "Off"}</span>
            </button>
            <div className="mt-3 grid max-h-[164px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 xl:max-h-[180px] xl:grid-cols-2">
              {studioBackgrounds
                .filter((background) => background.id !== "none")
                .map((background) => (
                  <button
                    key={background.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudioBackgroundId(background.id);
                      setAiBackgroundEnabled(true);
                    }}
                    className={`overflow-hidden rounded-[18px] border p-2 text-left transition ${
                      selectedStudioBackgroundId === background.id && aiBackgroundEnabled
                        ? "border-petal bg-white shadow-button"
                        : "border-white/70 bg-white/45 hover:bg-white/70"
                    }`}
                  >
                    <span
                      className="mb-2 flex h-12 items-center justify-center rounded-[14px]"
                      style={{ background: `linear-gradient(135deg, ${background.colors[0]}, ${background.colors[1]})` }}
                    >
                      <ImageIcon className="size-5" color={background.accent} />
                    </span>
                    <span className="block truncate text-xs font-bold text-ink">{background.name}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Frames</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category ? "border-petal bg-petal text-white shadow-button" : "border-white/70 bg-white/55 text-ink/58 hover:text-ink"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-3 grid max-h-[230px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-2">
              {visibleFrames.map((frame) => (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => setSelectedFrameId(frame.id)}
                  className={`rounded-booth border p-2 text-left transition ${
                    selectedFrameId === frame.id ? "border-petal bg-white shadow-button" : "border-white/70 bg-white/45 hover:bg-white/70"
                  }`}
                >
                  <FramePreview frame={frame} />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-ink">{frame.name}</span>
                    <Heart className="size-4 shrink-0" color={frame.accent} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Stickers</p>
              <button type="button" onClick={clearStickers} className="text-xs font-bold text-ink/45 transition hover:text-petal">
                Clear
              </button>
            </div>
            <div className="mt-3 grid max-h-[210px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 xl:max-h-[300px] xl:grid-cols-4">
              {stickerAssets.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => addSticker(sticker.id)}
                  className="group grid aspect-square min-h-12 place-items-center rounded-[18px] border border-white/70 bg-white/55 p-2 shadow-[0_10px_28px_rgba(255,134,189,0.1)] transition hover:-translate-y-0.5 hover:bg-white sm:min-h-14 xl:rounded-[20px]"
                  aria-label={`Add ${sticker.name} sticker`}
                >
                  <img src={sticker.src} alt="" className="h-full max-h-14 w-full object-contain transition group-hover:scale-110" />
                </button>
              ))}
            </div>

            {selectedSticker ? (
              <div className="mt-4 rounded-booth border border-white/70 bg-white/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">Selected sticker</p>
                  <Button variant="ghost" className="size-9 rounded-[18px] px-0" aria-label="Remove selected sticker" onClick={() => removeSticker(selectedSticker.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/45" htmlFor="sticker-size">
                  Size
                </label>
                <input
                  id="sticker-size"
                  type="range"
                  min="42"
                  max="140"
                  value={selectedSticker.size}
                  onChange={(event) => updateSticker(selectedSticker.id, { size: Number(event.target.value) })}
                  className="mt-2 w-full accent-petal"
                />
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/45" htmlFor="sticker-rotation">
                  Rotate
                </label>
                <input
                  id="sticker-rotation"
                  type="range"
                  min="-35"
                  max="35"
                  value={selectedSticker.rotation}
                  onChange={(event) => updateSticker(selectedSticker.id, { rotation: Number(event.target.value) })}
                  className="mt-2 w-full accent-petal"
                />
              </div>
            ) : (
              <p className="mt-3 rounded-[18px] bg-white/40 px-3 py-2 text-xs font-semibold text-ink/48">
                Tap a sticker, then drag it on the strip.
              </p>
            )}
          </div>

          </div>

          <div className="sticky bottom-3 z-20 mt-5 grid shrink-0 grid-cols-2 gap-3 rounded-booth border border-white/60 bg-white/65 p-2 backdrop-blur-xl xl:static xl:border-0 xl:bg-transparent xl:p-0 xl:backdrop-blur-0">
            <Button
              variant="secondary"
              icon={<RotateCcw className="size-5" />}
              onClick={() => {
                resetPhotos();
                setStep("session");
              }}
            >
              Retake
            </Button>
            <Button icon={<Download className="relative z-10 size-5" />} onClick={exportStrip}>
              Download
            </Button>
          </div>
        </aside>

        <main ref={previewRef} className="glass-panel relative order-1 flex h-[46dvh] min-h-[320px] items-center justify-center overflow-hidden rounded-booth p-3 sm:h-[50dvh] sm:p-5 xl:order-2 xl:h-auto xl:min-h-[72dvh]">
          <motion.div
            className="rounded-[34px] bg-transparent p-0"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          >
            <StripCanvas
              photos={renderPhotos}
              frame={selectedFrame}
              orientation={orientation}
              photoCount={photoCount}
              stickers={stickers}
              stickerAssets={stickerAssets}
              selectedStickerId={selectedStickerId}
              interactiveStickers
              onStickerSelect={setSelectedStickerId}
              onStickerMove={(stickerId, x, y) => updateSticker(stickerId, { x, y })}
              scale={canvasScale}
            />
          </motion.div>
          <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden="true">
            <div ref={exportRef}>
              <StripCanvas
                photos={renderPhotos}
                frame={selectedFrame}
                orientation={orientation}
                photoCount={photoCount}
                stickers={stickers}
                stickerAssets={stickerAssets}
                selectedStickerId={null}
                scale={1}
              />
            </div>
          </div>
          {photos.length === 0 ? (
            <div className="pointer-events-none absolute bottom-9 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-ink/60 backdrop-blur-xl">
              <Sparkles className="mr-2 inline size-4 text-petal" />
              Demo slots appear until you capture photos.
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
