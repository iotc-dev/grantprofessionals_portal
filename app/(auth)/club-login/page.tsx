"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ClubLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [abn, setAbn] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle magic link: ?code=F7A2B8C1
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleMagicLink(code);
    }
  }, [searchParams]);

  const handleMagicLink = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/club-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid access code.");
        setLoading(false);
        // Remove code from URL
        router.replace("/club-login");
        return;
      }

      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Format ABN as user types: XX XXX XXX XXX
  const formatAbn = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  };

  const handleAbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAbn(formatAbn(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const abnDigits = abn.replace(/\D/g, "");
    if (abnDigits.length !== 11) {
      setError("Please enter a valid 11-digit ABN.");
      return;
    }

    if (!passcode) {
      setError("Please enter your club passcode.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/club-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abn: abnDigits, passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Club Portal</h1>
        <p className="text-sm text-gray-600 mt-1">Access your club profile and grant applications</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ABN */}
        <div>
          <label className="block mb-2 font-medium text-gray-900 text-sm">ABN (Australian Business Number)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <input
              type="text"
              value={abn}
              onChange={handleAbnChange}
              placeholder="12 345 678 901"
              className="w-full pl-11 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-wider transition-all focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15"
              required
            />
          </div>
          <div className="mt-1.5 text-[0.8125rem] text-gray-500">Your organisation&apos;s 11-digit ABN</div>
        </div>

        {/* Passcode */}
        <div>
          <label className="block mb-2 font-medium text-gray-900 text-sm">Club Passcode</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPasscode ? "text" : "password"}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter your club passcode"
              className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-widest transition-all focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                {showPasscode ? (
                  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                ) : (
                  <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                )}
              </svg>
            </button>
          </div>
          <div className="mt-1.5 text-[0.8125rem] text-gray-500">Provided by your Grant Professional account executive</div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-danger-light text-danger text-sm rounded-lg flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gp-blue text-white font-semibold rounded-lg text-sm transition-all hover:bg-gp-blue-dark disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Grant Professionals admin?{" "}
          <Link href="/admin-login" className="text-gp-blue font-medium no-underline hover:underline">
            Admin Login →
          </Link>
        </p>
      </div>
    </div>
  );
}