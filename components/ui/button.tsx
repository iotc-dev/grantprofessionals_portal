/**
 * Button component with consistent styling variants
 * Used across: all pages
 */

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export function Button({
  variant = "secondary",
  size = "default",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gp-blue text-white hover:bg-gp-blue-dark border-gp-blue hover:border-gp-blue-dark",
    secondary:
      "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
    ghost:
      "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent",
    danger:
      "bg-danger text-white hover:bg-[#B71C1C] border-danger hover:border-[#B71C1C]",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    default: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      {children}
    </button>
  );
}