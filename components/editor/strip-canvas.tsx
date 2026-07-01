"use client";

import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Star, Text } from "react-konva";
import type { Context } from "konva/lib/Context";
import type { KonvaEventObject } from "konva/lib/Node";
import type { FrameConfig, Orientation, PlacedSticker, StickerAsset } from "@/store/booth-store";
import { useLoadedImage } from "@/components/editor/use-loaded-image";

type StripCanvasProps = {
  photos: string[];
  frame: FrameConfig;
  orientation: Orientation;
  photoCount: number;
  stickers?: PlacedSticker[];
  stickerAssets?: StickerAsset[];
  selectedStickerId?: string | null;
  interactiveStickers?: boolean;
  onStickerSelect?: (stickerId: string | null) => void;
  onStickerMove?: (stickerId: string, x: number, y: number) => void;
  scale?: number;
};

function getDimensions(orientation: Orientation) {
  return orientation === "vertical" ? { width: 420, height: 1260 } : { width: 1260, height: 420 };
}

function getSlots(orientation: Orientation, count: number) {
  const { width, height } = getDimensions(orientation);
  const padding = 34;
  const gap = 18;

  if (orientation === "vertical") {
    const slotHeight = (height - padding * 2 - gap * (count - 1) - 92) / count;
    return Array.from({ length: count }, (_, index) => ({
      x: padding,
      y: padding + index * (slotHeight + gap),
      width: width - padding * 2,
      height: slotHeight,
    }));
  }

  const slotWidth = (width - padding * 2 - gap * (count - 1) - 156) / count;
  return Array.from({ length: count }, (_, index) => ({
    x: padding + index * (slotWidth + gap),
    y: padding,
    width: slotWidth,
    height: height - padding * 2,
  }));
}

function getCoverCrop(image: HTMLImageElement, width: number, height: number) {
  const imageRatio = image.width / image.height;
  const slotRatio = width / height;

  if (imageRatio > slotRatio) {
    const cropWidth = image.height * slotRatio;
    return {
      x: (image.width - cropWidth) / 2,
      y: 0,
      width: cropWidth,
      height: image.height,
    };
  }

  const cropHeight = image.width / slotRatio;
  return {
    x: 0,
    y: (image.height - cropHeight) / 2,
    width: image.width,
    height: cropHeight,
  };
}

function roundedClip(context: Context, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function PhotoSlot({ src, x, y, width, height, index }: { src?: string; x: number; y: number; width: number; height: number; index: number }) {
  const image = useLoadedImage(src);

  if (!image) {
    return (
      <Group>
        <Rect x={x} y={y} width={width} height={height} fill="#fff8fb" cornerRadius={26} />
        <Text x={x} y={y + height / 2 - 16} width={width} align="center" text={`Photo ${index + 1}`} fill="#ff86bd" fontSize={26} fontStyle="bold" />
      </Group>
    );
  }

  const crop = getCoverCrop(image, width, height);

  return (
    <Group clipFunc={(context) => roundedClip(context, x, y, width, height, 26)}>
      <Rect x={x} y={y} width={width} height={height} fill="#ffffff" cornerRadius={26} />
      <KonvaImage image={image} x={x} y={y} width={width} height={height} crop={crop} />
    </Group>
  );
}

function Pattern({ frame, width, height }: { frame: FrameConfig; width: number; height: number }) {
  const shapes = Array.from({ length: 18 }, (_, index) => {
    const x = 24 + ((index * 73) % Math.max(width - 48, 1));
    const y = 26 + ((index * 119) % Math.max(height - 52, 1));
    return { x, y, size: 8 + (index % 4) * 3 };
  });

  if (frame.pattern === "none") return null;

  return (
    <Group opacity={0.42}>
      {shapes.map((shape, index) => {
        if (frame.pattern === "stars") {
          return <Star key={index} x={shape.x} y={shape.y} numPoints={5} innerRadius={shape.size / 2} outerRadius={shape.size} fill={frame.accent} />;
        }
        if (frame.pattern === "dots") {
          return <Rect key={index} x={shape.x} y={shape.y} width={shape.size} height={shape.size} fill={frame.accent} cornerRadius={shape.size} />;
        }
        if (frame.pattern === "checker") {
          return <Rect key={index} x={shape.x} y={shape.y} width={shape.size * 1.8} height={shape.size * 1.8} fill={frame.accent} rotation={45} />;
        }
        if (frame.pattern === "ribbon") {
          return (
            <Group key={index} x={shape.x} y={shape.y} rotation={index % 2 === 0 ? -14 : 16}>
              <Rect x={-shape.size} y={-shape.size / 2} width={shape.size} height={shape.size} fill={frame.accent} cornerRadius={4} />
              <Rect x={0} y={-shape.size / 2} width={shape.size} height={shape.size} fill={frame.accent} cornerRadius={4} />
              <Rect x={-2} y={-2} width={4} height={4} fill="#ffffff" cornerRadius={4} />
            </Group>
          );
        }
        return (
          <Group key={index} x={shape.x} y={shape.y}>
            <Circle x={-shape.size / 3} y={-shape.size / 3} radius={shape.size / 2} fill={frame.accent} />
            <Circle x={shape.size / 3} y={-shape.size / 3} radius={shape.size / 2} fill={frame.accent} />
            <Rect x={-shape.size / 2} y={-shape.size / 6} width={shape.size} height={shape.size} fill={frame.accent} rotation={45} cornerRadius={2} />
          </Group>
        );
      })}
    </Group>
  );
}

function StickerNode({
  sticker,
  asset,
  selected,
  interactive,
  onSelect,
  onMove,
}: {
  sticker: PlacedSticker;
  asset?: StickerAsset;
  selected: boolean;
  interactive: boolean;
  onSelect?: (stickerId: string | null) => void;
  onMove?: (stickerId: string, x: number, y: number) => void;
}) {
  const image = useLoadedImage(asset?.src);

  if (!image || !asset) return null;

  function handleSelect(event: KonvaEventObject<MouseEvent | TouchEvent>) {
    event.cancelBubble = true;
    onSelect?.(sticker.id);
  }

  function handleDragEnd(event: KonvaEventObject<DragEvent>) {
    onMove?.(sticker.id, event.target.x(), event.target.y());
  }

  function handleDragMove(event: KonvaEventObject<DragEvent>) {
    onMove?.(sticker.id, event.target.x(), event.target.y());
  }

  return (
    <Group
      x={sticker.x}
      y={sticker.y}
      rotation={sticker.rotation}
      draggable={interactive}
      onClick={handleSelect}
      onTap={handleSelect}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {selected ? (
        <Rect
          x={-sticker.size / 2 - 8}
          y={-sticker.size / 2 - 8}
          width={sticker.size + 16}
          height={sticker.size + 16}
          stroke="#ff70ae"
          strokeWidth={4}
          dash={[10, 8]}
          cornerRadius={18}
        />
      ) : null}
      <KonvaImage image={image} x={-sticker.size / 2} y={-sticker.size / 2} width={sticker.size} height={sticker.size} />
    </Group>
  );
}

export function StripCanvas({
  photos,
  frame,
  orientation,
  photoCount,
  stickers = [],
  stickerAssets = [],
  selectedStickerId = null,
  interactiveStickers = false,
  onStickerSelect,
  onStickerMove,
  scale = 0.45,
}: StripCanvasProps) {
  const { width, height } = getDimensions(orientation);
  const slots = getSlots(orientation, photoCount);
  const titleX = orientation === "vertical" ? 34 : width - 134;
  const titleY = orientation === "vertical" ? height - 72 : 38;
  const titleWidth = orientation === "vertical" ? width - 68 : 100;

  return (
    <Stage width={width * scale} height={height * scale} scaleX={scale} scaleY={scale} onMouseDown={() => onStickerSelect?.(null)} onTouchStart={() => onStickerSelect?.(null)}>
      <Layer>
        <Rect width={width} height={height} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: width, y: height }} fillLinearGradientColorStops={[0, frame.background[0], 1, frame.background[1]]} cornerRadius={34} />
        <Pattern frame={frame} width={width} height={height} />
        {slots.map((slot, index) => (
          <Group key={index}>
            <Rect x={slot.x - 8} y={slot.y - 8} width={slot.width + 16} height={slot.height + 16} fill={frame.border} cornerRadius={32} shadowColor="#ff86bd" shadowOpacity={0.15} shadowBlur={18} />
            <PhotoSlot src={photos[index]} index={index} {...slot} />
          </Group>
        ))}
        {stickers.map((sticker) => (
          <StickerNode
            key={sticker.id}
            sticker={sticker}
            asset={stickerAssets.find((asset) => asset.id === sticker.assetId)}
            selected={selectedStickerId === sticker.id}
            interactive={interactiveStickers}
            onSelect={onStickerSelect}
            onMove={onStickerMove}
          />
        ))}
        <Text x={titleX} y={titleY} width={titleWidth} align="center" text="Pinky Booth" fill={frame.accent} fontSize={orientation === "vertical" ? 30 : 24} fontStyle="bold" />
      </Layer>
    </Stage>
  );
}
