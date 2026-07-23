"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { Button } from "@/components/ui/button";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length !== 6) return;
    const newCode = pasted.split("");
    setCode(newCode);
    inputRefs.current[5]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: fullCode }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid verification code");
      }
      onVerified();
    } catch (err) {
      setError((err as Error).message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          We sent a verification code to{" "}
          <span className="font-medium text-[#121C28]">{email}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="h-12 w-10 rounded-lg border border-[#D1D5DB] text-center text-lg font-semibold text-[#121C28] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
          />
        ))}
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        Verify email
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-[#6B7280] transition-colors hover:text-[#121C28] cursor-pointer"
      >
        &larr; Use a different email
      </button>
    </form>
  );
}
