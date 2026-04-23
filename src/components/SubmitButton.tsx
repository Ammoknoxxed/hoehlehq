// src/components/SubmitButton.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isIconOnly?: boolean; // Für kleine Buttons wie das Löschen-Kreuz
}

export default function SubmitButton({ children, className, isIconOnly, ...props }: SubmitButtonProps) {
  // Dieser Hook weiß automatisch, ob das umschließende <form> gerade "arbeitet"
  const { pending } = useFormStatus();

  return (
    <button 
      {...props} 
      disabled={pending || props.disabled}
      className={`${className} disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2`}
    >
      {pending ? (
        <Loader2 className="animate-spin" size={isIconOnly ? 14 : 18} />
      ) : (
        children
      )}
    </button>
  );
}