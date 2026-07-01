"use client";

import "@tensorflow/tfjs-backend-webgl";
import type { SemanticPersonSegmentation } from "@tensorflow-models/body-pix";

export type StudioBackground = {
  id: string;
  name: string;
  colors: [string, string];
  accent: string;
  motif: "none" | "bubbles" | "softbox" | "curtain" | "clouds" | "sparkles" | "stars" | "hearts" | "grid";
};

let modelPromise: Promise<import("@tensorflow-models/body-pix").BodyPix> | null = null;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load photo for background removal."));
    image.src = src;
  });
}

async function getModel() {
  if (!modelPromise) {
    modelPromise = Promise.all([import("@tensorflow/tfjs"), import("@tensorflow-models/body-pix")]).then(async ([tf, bodyPix]) => {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      return bodyPix.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });
    });
  }

  return modelPromise;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.32);
  ctx.bezierCurveTo(x - size * 0.52, y - size * 0.18, x - size, y + size * 0.28, x, y + size);
  ctx.bezierCurveTo(x + size, y + size * 0.28, x + size * 0.52, y - size * 0.18, x, y + size * 0.32);
  ctx.closePath();
}

function drawMotif(ctx: CanvasRenderingContext2D, width: number, height: number, background: StudioBackground) {
  const accent = background.accent;
  ctx.save();

  if (background.motif === "softbox") {
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#ffffff";
    roundedRect(ctx, width * 0.12, height * 0.1, width * 0.24, height * 0.72, 24);
    ctx.fill();
    roundedRect(ctx, width * 0.66, height * 0.1, width * 0.22, height * 0.72, 24);
    ctx.fill();
  }

  if (background.motif === "curtain") {
    for (let i = 0; i < 9; i += 1) {
      const x = (width / 8) * i;
      const gradient = ctx.createLinearGradient(x, 0, x + width / 8, 0);
      gradient.addColorStop(0, `${accent}22`);
      gradient.addColorStop(0.5, "#ffffff55");
      gradient.addColorStop(1, `${accent}16`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, 0, width / 8 + 2, height);
    }
  }

  if (background.motif === "grid") {
    ctx.strokeStyle = `${accent}36`;
    ctx.lineWidth = Math.max(2, width * 0.003);
    const step = Math.max(52, width * 0.09);
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  if (background.motif === "clouds") {
    ctx.fillStyle = "#ffffff99";
    for (let i = 0; i < 8; i += 1) {
      const x = ((i * 151) % width) + width * 0.04;
      const y = ((i * 83) % height) + height * 0.07;
      const r = width * (0.035 + (i % 3) * 0.012);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.arc(x + r * 0.82, y + r * 0.08, r * 0.78, 0, Math.PI * 2);
      ctx.arc(x - r * 0.72, y + r * 0.12, r * 0.68, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (["bubbles", "sparkles", "stars", "hearts"].includes(background.motif)) {
    for (let i = 0; i < 24; i += 1) {
      const x = 24 + ((i * 97) % Math.max(width - 48, 1));
      const y = 24 + ((i * 131) % Math.max(height - 48, 1));
      const size = Math.max(12, width * (0.012 + (i % 4) * 0.006));
      ctx.globalAlpha = 0.16 + (i % 3) * 0.06;
      ctx.fillStyle = i % 2 === 0 ? accent : "#ffffff";

      if (background.motif === "bubbles") {
        ctx.beginPath();
        ctx.arc(x, y, size * 1.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (background.motif === "hearts") {
        heartPath(ctx, x, y, size);
        ctx.fill();
      } else {
        ctx.translate(x, y);
        ctx.rotate((i % 8) * 0.35);
        ctx.fillRect(-size * 0.18, -size, size * 0.36, size * 2);
        ctx.fillRect(-size, -size * 0.18, size * 2, size * 0.36);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }

  ctx.restore();
}

export function drawStudioBackground(ctx: CanvasRenderingContext2D, width: number, height: number, background: StudioBackground) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, background.colors[0]);
  gradient.addColorStop(1, background.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.5, height * 0.26, 0, width * 0.5, height * 0.26, width * 0.62);
  glow.addColorStop(0, "#ffffffaa");
  glow.addColorStop(1, "#ffffff00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  drawMotif(ctx, width, height, background);
}

function createMask(segmentation: SemanticPersonSegmentation) {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = segmentation.width;
  maskCanvas.height = segmentation.height;
  const maskContext = maskCanvas.getContext("2d");
  if (!maskContext) throw new Error("Could not prepare AI mask.");

  const mask = maskContext.createImageData(segmentation.width, segmentation.height);
  for (let index = 0; index < segmentation.data.length; index += 1) {
    const offset = index * 4;
    const value = segmentation.data[index] ? 255 : 0;
    mask.data[offset] = 0;
    mask.data[offset + 1] = 0;
    mask.data[offset + 2] = 0;
    mask.data[offset + 3] = value;
  }
  maskContext.putImageData(mask, 0, 0);
  return maskCanvas;
}

export async function replacePhotoBackground(photo: string, background: StudioBackground) {
  const [model, image] = await Promise.all([getModel(), loadImage(photo)]);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  const segmentation = await model.segmentPerson(image, {
    flipHorizontal: false,
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("Could not render AI background.");

  drawStudioBackground(outputContext, width, height, background);

  const subject = document.createElement("canvas");
  subject.width = width;
  subject.height = height;
  const subjectContext = subject.getContext("2d");
  if (!subjectContext) throw new Error("Could not render AI subject.");

  subjectContext.drawImage(image, 0, 0, width, height);
  subjectContext.globalCompositeOperation = "destination-in";
  subjectContext.imageSmoothingEnabled = true;
  subjectContext.drawImage(createMask(segmentation), 0, 0, width, height);

  outputContext.drawImage(subject, 0, 0);
  return output.toDataURL("image/jpeg", 0.96);
}
