"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation, useResendOtpMutation } from "@/store/authApi";

interface EmailVerificationProps {
  email: string;
  onVerified: (data: { user: any; accessToken: string; refreshToken: string }) => void;
  onBack: () => void;
}

interface VerifyResult {
  user: { id: string; name: string; email: string; avatar?: string; role: string; createdAt: string };
  accessToken: string;
  refreshToken: string;
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp] = useResendOtpMutation();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
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
    try {
      const result: VerifyResult = await verifyEmail({ email, code: fullCode }).unwrap();
      onVerified(result);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Verification failed. Please try again.");
    }
  }

  async function handleResend() {
    setResendMessage(null);
    setError(null);
    try {
      await resendOtp({ email }).unwrap();
      setResendMessage("New code sent!");
      setTimeout(() => setResendMessage(null), 3000);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to resend code");
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

      {resendMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-600">
          {resendMessage}
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

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          Resend code
        </button>
      </div>

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
