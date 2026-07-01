"use client";

import { Heart, Sparkles, Stars } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { useBoothStore } from "@/store/booth-store";

export function Landing() {
  const setStep = useBoothStore((state) => state.setStep);
  const resetPhotos = useBoothStore((state) => state.resetPhotos);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!floatRef.current) return;

    const context = gsap.context(() => {
      gsap.to("[data-gsap-float]", {
        y: (index) => (index % 2 === 0 ? -10 : 12),
        rotate: (index) => (index % 2 === 0 ? 8 : -8),
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
      });
    }, floatRef);

    return () => context.revert();
  }, []);

  return (
    <section className="relative min-h-dvh overflow-hidden px-5 py-5 sm:px-8">
      <div className="soft-grid absolute inset-0 opacity-55" />
      <div ref={floatRef} aria-hidden="true">
      <motion.div
        data-gsap-float
        aria-hidden="true"
        className="absolute left-[8%] top-[18%] text-petal"
        animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="size-7 fill-current" />
      </motion.div>
      <motion.div
        data-gsap-float
        aria-hidden="true"
        className="absolute right-[12%] top-[16%] text-lilac"
        animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Stars className="size-9 fill-current" />
      </motion.div>
      <motion.div
        data-gsap-float
        aria-hidden="true"
        className="absolute bottom-[18%] left-[18%] text-cloud"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 18, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="size-8 fill-current" />
      </motion.div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-40px)] max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="max-w-2xl pt-8 lg:pt-0"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-2 text-sm font-semibold text-petal shadow-[0_10px_30px_rgba(255,134,189,0.16)] backdrop-blur-xl">
            <Sparkles className="size-4" />
            Soft studio mode
          </div>
          <h1 className="text-balance text-6xl font-black leading-[0.92] text-ink sm:text-7xl lg:text-8xl">
            Pinky Booth
          </h1>
          <p className="mt-6 max-w-xl text-xl font-medium leading-8 text-ink/68 sm:text-2xl">
            Create your cutest memories.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              className="min-h-14 px-7 text-base"
              icon={<Sparkles className="relative z-10 size-5" />}
              onClick={() => {
                resetPhotos();
                setStep("session");
              }}
            >
              Start Booth
            </Button>
            <Button variant="secondary" icon={<Heart className="size-5" />} onClick={() => setStep("editor")}>
              Open Editor
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 28, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, y: [0, -14, 0], rotate: [-4, -1.5, -4] }}
          transition={{
            opacity: { delay: 0.08, duration: 0.48 },
            scale: { delay: 0.08, type: "spring", stiffness: 80, damping: 16 },
            y: { delay: 0.18, duration: 5.6, repeat: Infinity, ease: "easeInOut" },
            rotate: { delay: 0.18, duration: 6.4, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
          className="relative mx-auto flex w-full max-w-[640px] items-end justify-center self-end will-change-transform lg:self-center"
        >
          <div className="absolute inset-x-8 bottom-4 h-20 rounded-[50%] bg-petal/20 blur-2xl" />
          <Image
            src="/brand/pinky-booth-new.png"
            alt="Pastel pink photobooth kiosk"
            width={1024}
            height={1024}
            priority
            className="relative h-auto w-full rotate-[-2deg] drop-shadow-[0_42px_80px_rgba(255,134,189,0.38)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
