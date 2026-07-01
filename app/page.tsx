"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Landing } from "@/components/landing";
import { PhotoSession } from "@/components/booth/photo-session";
import { PhotoEditor } from "@/components/editor/photo-editor";
import { useBoothStore } from "@/store/booth-store";

export default function Home() {
  const step = useBoothStore((state) => state.step);

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          {step === "landing" ? <Landing /> : null}
          {step === "session" ? <PhotoSession /> : null}
          {step === "editor" ? <PhotoEditor /> : null}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
