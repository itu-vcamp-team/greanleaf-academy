"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function GlassCard({ children, className, animate = false }: GlassCardProps) {
  const Component = animate ? motion.div : "div";
  
  return (
    <Component
      {...(animate ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true }
      } : {})}
      className={cn(
        "glass p-6 rounded-2xl transition-all duration-300 hover:border-foreground/10",
        className
      )}
    >
      {children}
    </Component>
  );
}
