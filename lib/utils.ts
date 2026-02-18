import { clsx, type ClassValue } from "clsx"
import * as Icons from "lucide-react" // Import all icons as a namespace
import { LucideIcon } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a LucideIcon component based on a string name.
 * Falls back to 'HelpCircle' (or any icon of your choice) if the name is not found.
 */
export function getIconComponent(iconName: string): LucideIcon {
  // Cast Icons to any to allow string indexing, then cast the result back to LucideIcon
  const Icon = (Icons as any)[iconName] as LucideIcon;

  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in lucide-react. Falling back to HelpCircle.`);
    return Icons.HelpCircle; 
  }

  return Icon;
}