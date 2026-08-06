"use client";

import { useEffect, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation, useResendOtpMutation } from "@/store/authApi";
import type { AuthData } from "@/store/authApi";
import { Mail } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onVerified: (data: AuthData) => void;
  onBack: () => void;
}

const RESEND_COOLDOWN = 60;

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp] = useResendOtpMutation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
      const result = await verifyEmail({ email, code: fullCode }).unwrap();
      setVerified(true);
      setTimeout(() => onVerified(result), 900);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ||
          "Verification failed. Please try again."
      );
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResendMessage(null);
    setError(null);
    try {
      await resendOtp({ email }).unwrap();
      setResendMessage("New code sent!");
      setCountdown(RESEND_COOLDOWN);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendMessage(null), 3000);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message || "Failed to resend code"
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        <div className="rounded-[3px] border border-border-light bg-surface p-8 text-center shadow-card sm:p-10">
          <AnimatePresence mode="wait">
            {verified ? (
              <motion.div
                key="success"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success"
                >
                  <svg className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
                <h1 className="text-xl font-bold tracking-tight text-text">
                  Verified!
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Taking you to your dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[3px] bg-primary-bg"
                >
                  <Mail className="h-6 w-6 text-primary" />
                </motion.div>

                <h1 className="text-2xl font-bold tracking-tight text-text">
                  Check your email
                </h1>
                <p className="text-sm text-text-secondary">
                  We sent a verification code to{" "}
                  <span className="font-medium text-text">{email}</span>
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[3px] border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger"
                  >
                    {error}
                  </motion.div>
                )}

                {resendMessage && (
                  <div className="rounded-[3px] border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
                    {resendMessage}
                  </div>
                )}

                <div className="flex justify-center gap-2.5">
                  {code.map((digit, i) => (
                    <motion.input
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="h-14 w-11 rounded-[3px] border border-border-input bg-surface text-center text-xl font-semibold text-text transition-shadow hover:border-border focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>

                <Button type="submit" size="lg" className="w-full cursor-pointer" isLoading={isLoading}>
                  Verify email
                </Button>

                <div className="text-center">
                  <span className="text-sm text-text-tertiary">
                    Didn&apos;t get the code?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary-dark disabled:cursor-not-allowed disabled:text-text-placeholder cursor-pointer"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full cursor-pointer text-center text-sm text-text-tertiary transition-colors hover:text-text"
                >
                  &larr; Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}