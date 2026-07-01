# Pinky Booth

Pinky Booth is a playful web photobooth for creating pastel photo strips directly in the browser. Users can take photos with their camera, arrange them into vertical or horizontal strips, choose cute frame styles, decorate the result with stickers, optionally apply an automatic studio-style background, and download the final strip as a PNG.

The app is built with Next.js, React, Tailwind CSS, Konva, Zustand, and browser camera APIs.

## What It Does

- Capture a 2, 4, or 6-photo session from the device camera.
- Import existing photos when users want to edit images they already have.
- Switch between vertical and horizontal photobooth strip layouts.
- Pick from multiple frame categories such as Pastel, Minimal, Korean, Vintage, Y2K, Love, Cute, Gradient, Glass, and Polaroid.
- Add, drag, resize, rotate, and remove decorative stickers.
- Use automatic background replacement with preset studio backgrounds.
- Preview the final strip live while editing.
- Download the finished photobooth strip as a high-resolution PNG.
- Use a responsive editor that adapts for mobile while keeping a spacious desktop layout.

## How To Use

1. Open the app and start a photo session.
2. Choose how many photos you want in the strip.
3. Allow camera permission when the browser asks.
4. Start the countdown and let the app capture each photo.
5. In the editor, choose the strip layout, frame, and optional AI studio background.
6. Add stickers, then drag them onto the strip.
7. Select a sticker to adjust its size or rotation.
8. Press **Download** to save the final image.

You can also skip the camera flow and use **Choose Photos** in the editor to upload images from your device.

## Mobile Experience

Pinky Booth is designed to work comfortably on phones:

- The strip preview stays visible at the top of the editor.
- Editing controls stack below the preview.
- Sticker buttons are larger and easier to tap.
- The main action buttons stay reachable while scrolling.
- Desktop users still get the wider two-column editing layout.

## Tech Stack

- **Next.js 15** for the app framework.
- **React 19** for UI.
- **Tailwind CSS** for styling.
- **Konva / react-konva** for rendering the editable photobooth strip.
- **Zustand** for app state.
- **react-webcam** for camera capture.
- **html2canvas** for exporting the final strip.
- **TensorFlow BodyPix** for background replacement.

## Project Structure

```text
app/                  Next.js app entry, layout, and global styles
components/booth/     Camera capture flow
components/editor/    Photobooth strip editor and canvas renderer
components/ui/        Reusable UI controls
data/                 Frame, sticker, and background presets
lib/                  Utilities and background processing helpers
public/               Brand assets and sticker SVG files
store/                Zustand photobooth state
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. Open Vercel and choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the default Next.js settings.
5. Deploy.

Recommended Vercel settings:

- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

## Browser Notes

- Camera capture requires HTTPS in production. Vercel provides HTTPS by default.
- Users must grant camera permission before taking photos.
- Background replacement runs in the browser and may be slower on older mobile devices.
- Downloaded strips are generated locally in the browser; user photos are not uploaded to a server by this app.

## Verification

Before deployment, run:

```bash
npm run build
```

The project currently uses Next.js' build-time type checking. The `npm run lint` script may ask to create an ESLint configuration if one has not been set up yet.

## License

This project is private by default. Add a license if you plan to publish or distribute it publicly.
