"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "sparkle-mask bg-gradient-to-r from-petal via-[#ff9dcb] to-lilac text-white shadow-button hover:shadow-glass",
  secondary:
    "border border-white/70 bg-white/70 text-ink shadow-[0_12px_35px_rgba(255,134,189,0.15)] hover:bg-white",
  ghost: "bg-transparent text-ink/70 hover:bg-white/50 hover:text-ink",
  danger: "bg-[#ff6f91] text-white shadow-button hover:bg-[#ff5b82]",
};

export function Button({ className, variant = "primary", icon, children, type = "button", ...props }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 1, scale: 0.98 }}
      className={cn(
        "relative inline-flex min-h-11 items-center justify-center gap-2 rounded-booth px-5 py-3 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
