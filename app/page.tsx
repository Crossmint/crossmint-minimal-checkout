"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CrossmintEmbeddedCheckout,
  useCrossmintCheckout,
} from "@crossmint/client-sdk-react-ui";
import { createOrder } from "./actions";

const PRESETS = ["5", "10", "25", "50"];
const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const MIN_AMOUNT = 1;

export default function Home() {
  const [amount, setAmount] = useState("1");
  const [debouncedAmount, setDebouncedAmount] = useState("1");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { order } = useCrossmintCheckout();

  console.log("[order] phase:", order?.phase, order);

  const scheduleDebounce = useCallback((next: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const parsed = Number.parseFloat(next);
    if (!Number.isNaN(parsed) && parsed >= MIN_AMOUNT) {
      timerRef.current = setTimeout(() => setDebouncedAmount(next), 500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleNumpad = (key: string) => {
    setAmount((prev) => {
      let next: string;
      if (key === "⌫") {
        next = prev.length > 1 ? prev.slice(0, -1) : "1";
      } else if (key === ".") {
        next = prev.includes(".") ? prev : `${prev}.`;
      } else {
        next = prev === "0" ? key : prev + key;
      }
      scheduleDebounce(next);
      return next;
    });
  };

  const handlePreset = (value: string) => {
    setAmount(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedAmount(value), 500);
  };

  const { data } = useQuery({
    queryKey: ["order", debouncedAmount],
    queryFn: () => {
      console.log("[order] creating order for", debouncedAmount);
      return createOrder(
        debouncedAmount,
        "test@crossmint.com",
        "HkuqRgeLTz1t384Z3fKv8f4fJZKLCTghX5Tq6WzPyyuZ"
      );
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <div className="flex flex-col items-center justify-between min-h-screen max-w-md mx-auto px-4 py-8">
      {/* Amount display */}
      <div className="flex flex-col items-center gap-1 pt-8">
        <span className="text-6xl font-bold tracking-tight">
          {`$${amount}`}
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-3 w-full justify-center">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => handlePreset(p)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${amount === p
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
          >
            {`$${p}`}
          </button>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {NUMPAD.map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => handleNumpad(key)}
            className="text-2xl font-medium py-4 rounded-xl active:bg-neutral-800 transition-colors"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Checkout */}
      <div className="w-full min-h-[60px]">
        {data && (
          <CrossmintEmbeddedCheckout
            key={data.orderId}
            orderId={data.orderId}
            clientSecret={data.clientSecret}
            payment={{
              crypto: { enabled: false },
              fiat: {
                enabled: true,
                allowedMethods: {
                  applePay: true,
                  card: false,
                  googlePay: false,
                },
              },
            }}
            appearance={{
              variables: {
                colors: {
                  backgroundPrimary: "#000000",
                },
              },
              rules: {
                DestinationInput: { display: "hidden" },
                ReceiptEmailInput: { display: "hidden" },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
