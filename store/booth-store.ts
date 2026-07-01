"use client";

import { create } from "zustand";
import frames from "@/data/frames.json";
import stickers from "@/data/stickers.json";

export type Step = "landing" | "session" | "editor";
export type PhotoCount = 2 | 4 | 6;
export type Orientation = "vertical" | "horizontal";
export type FrameCategory = "Pastel" | "Minimal" | "Korean" | "Vintage" | "Y2K" | "Love" | "Cute" | "Gradient" | "Glass" | "Polaroid";
export type StudioBackgroundId = string;

export type FrameConfig = {
  id: string;
  name: string;
  category: FrameCategory;
  background: string[];
  border: string;
  accent: string;
  pattern: "none" | "hearts" | "stars" | "dots" | "checker" | "ribbon";
};

export type StickerAsset = {
  id: string;
  name: string;
  src: string;
  tone: string;
};

export type PlacedSticker = {
  id: string;
  assetId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type BoothState = {
  step: Step;
  photos: string[];
  selectedFrameId: string;
  photoCount: PhotoCount;
  orientation: Orientation;
  activeCategory: FrameCategory | "All";
  stickers: PlacedSticker[];
  selectedStickerId: string | null;
  aiBackgroundEnabled: boolean;
  selectedStudioBackgroundId: StudioBackgroundId;
  setStep: (step: Step) => void;
  addPhoto: (photo: string) => void;
  setPhotos: (photos: string[]) => void;
  resetPhotos: () => void;
  setSelectedFrameId: (frameId: string) => void;
  setPhotoCount: (count: PhotoCount) => void;
  setOrientation: (orientation: Orientation) => void;
  setActiveCategory: (category: FrameCategory | "All") => void;
  addSticker: (assetId: string) => void;
  updateSticker: (stickerId: string, patch: Partial<Omit<PlacedSticker, "id" | "assetId">>) => void;
  removeSticker: (stickerId: string) => void;
  clearStickers: () => void;
  setSelectedStickerId: (stickerId: string | null) => void;
  setAiBackgroundEnabled: (enabled: boolean) => void;
  setSelectedStudioBackgroundId: (backgroundId: StudioBackgroundId) => void;
};

const frameList = frames as FrameConfig[];
export const stickerAssets = stickers as StickerAsset[];

export const useBoothStore = create<BoothState>((set) => ({
  step: "landing",
  photos: [],
  selectedFrameId: frameList[0].id,
  photoCount: 4,
  orientation: "vertical",
  activeCategory: "All",
  stickers: [],
  selectedStickerId: null,
  aiBackgroundEnabled: false,
  selectedStudioBackgroundId: "cotton-candy",
  setStep: (step) => set({ step }),
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  setPhotos: (photos) => set({ photos }),
  resetPhotos: () => set({ photos: [] }),
  setSelectedFrameId: (selectedFrameId) => set({ selectedFrameId }),
  setPhotoCount: (photoCount) => set({ photoCount }),
  setOrientation: (orientation) => set({ orientation }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  addSticker: (assetId) =>
    set((state) => {
      const sticker: PlacedSticker = {
        id: `${assetId}-${Date.now()}`,
        assetId,
        x: state.orientation === "vertical" ? 300 : 1060,
        y: state.orientation === "vertical" ? 1080 : 310,
        size: 74,
        rotation: -8 + Math.round(Math.random() * 16),
      };

      return {
        stickers: [...state.stickers, sticker],
        selectedStickerId: sticker.id,
      };
    }),
  updateSticker: (stickerId, patch) =>
    set((state) => ({
      stickers: state.stickers.map((sticker) => (sticker.id === stickerId ? { ...sticker, ...patch } : sticker)),
    })),
  removeSticker: (stickerId) =>
    set((state) => ({
      stickers: state.stickers.filter((sticker) => sticker.id !== stickerId),
      selectedStickerId: state.selectedStickerId === stickerId ? null : state.selectedStickerId,
    })),
  clearStickers: () => set({ stickers: [], selectedStickerId: null }),
  setSelectedStickerId: (selectedStickerId) => set({ selectedStickerId }),
  setAiBackgroundEnabled: (aiBackgroundEnabled) => set({ aiBackgroundEnabled }),
  setSelectedStudioBackgroundId: (selectedStudioBackgroundId) => set({ selectedStudioBackgroundId }),
}));

export const allFrames = frameList;
