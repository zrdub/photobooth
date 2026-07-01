"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, Sparkles, SwitchCamera, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { playShutter } from "@/lib/utils";
import { useBoothStore } from "@/store/booth-store";

export function PhotoSession() {
  const webcamRef = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [shotNumber, setShotNumber] = useState(0);
  const photos = useBoothStore((state) => state.photos);
  const captureTotal = useBoothStore((state) => state.photoCount);
  const addPhoto = useBoothStore((state) => state.addPhoto);
  const resetPhotos = useBoothStore((state) => state.resetPhotos);
  const setStep = useBoothStore((state) => state.setStep);

  const videoConstraints = useMemo(
    () => ({
      width: 1280,
      height: 960,
      facingMode: devices.length ? undefined : "user",
      deviceId: devices[deviceIndex]?.deviceId,
    }),
    [devices, deviceIndex],
  );

  const refreshDevices = useCallback(async () => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = mediaDevices.filter((device) => device.kind === "videoinput");
    setDevices(cameras);
  }, []);

  useEffect(() => {
    refreshDevices().catch(() => undefined);
  }, [refreshDevices]);

  useEffect(() => {
    if (photos.length >= captureTotal) {
      const timeout = window.setTimeout(() => setStep("editor"), 750);
      return () => window.clearTimeout(timeout);
    }
  }, [photos.length, setStep]);

  const captureOne = useCallback(async () => {
    for (const value of [3, 2, 1]) {
      setCountdown(value);
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }

    setCountdown(null);
    const image = webcamRef.current?.getScreenshot();
    if (!image) {
      toast.error("Camera did not return a photo.");
      return false;
    }

    playShutter();
    setFlashKey((key) => key + 1);
    addPhoto(image);
    return true;
  }, [addPhoto]);

  const startCapture = useCallback(async () => {
    resetPhotos();
    setShotNumber(0);
    setIsCapturing(true);

    for (let index = 0; index < captureTotal; index += 1) {
      setShotNumber(index + 1);
      const captured = await captureOne();
      if (!captured) {
        break;
      }
      if (index < captureTotal - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 3000));
      }
    }

    setIsCapturing(false);
  }, [captureOne, resetPhotos]);

  return (
    <section className="min-h-dvh px-4 py-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_360px]">
        <div className="glass-panel relative min-h-[68dvh] overflow-hidden rounded-booth p-3 sm:p-4">
          <div className="camera-video h-[68dvh] overflow-hidden rounded-[20px] bg-white/50">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              videoConstraints={videoConstraints}
              mirrored
              onUserMedia={refreshDevices}
              className="h-full w-full"
            />
          </div>

          <AnimatePresence>
            {countdown && (
              <motion.div
                key={countdown}
                initial={{ opacity: 0, scale: 0.45 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.4 }}
                className="absolute inset-0 grid place-items-center bg-white/18 text-[26vw] font-black text-white drop-shadow-[0_18px_40px_rgba(255,104,173,0.65)] sm:text-[220px]"
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {flashKey > 0 && (
              <motion.div
                key={flashKey}
                className="pointer-events-none absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              />
            )}
          </AnimatePresence>
        </div>

        <aside className="glass-panel rounded-booth p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-petal">Photo session</p>
              <h2 className="mt-2 text-3xl font-black text-ink">Ready?</h2>
            </div>
            <Button variant="ghost" className="size-11 px-0" aria-label="Back" onClick={() => setStep("landing")}>
              <X className="size-5" />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {Array.from({ length: captureTotal }).map((_, index) => (
              <div key={index} className="aspect-[3/4] overflow-hidden rounded-[18px] border border-white/70 bg-white/50">
                {photos[index] ? <img src={photos[index]} alt={`Capture ${index + 1}`} className="h-full w-full object-cover" /> : null}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] bg-white/45 p-4 text-sm font-semibold text-ink/65">
            {isCapturing ? `Shot ${shotNumber} of ${captureTotal}` : `${captureTotal} photos, three seconds apart, then straight to edit.`}
          </div>

          <div className="mt-5 grid gap-3">
            <Button disabled={isCapturing} icon={<Camera className="relative z-10 size-5" />} onClick={startCapture}>
              {isCapturing ? "Capturing" : "Start Countdown"}
            </Button>
            <Button
              variant="secondary"
              disabled={isCapturing || devices.length < 2}
              icon={<SwitchCamera className="size-5" />}
              onClick={() => setDeviceIndex((index) => (index + 1) % Math.max(devices.length, 1))}
            >
              Switch Camera
            </Button>
            <Button variant="ghost" icon={<Sparkles className="size-5" />} onClick={() => setStep("editor")}>
              Skip to Editor
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
