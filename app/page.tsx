"use client";

import { useEffect, useState } from "react";
import {
  CrossmintProvider,
  CrossmintEmbeddedCheckout,
} from "@crossmint/client-sdk-react-ui";
import { createOrder } from "./actions";

const apiKey = process.env.NEXT_PUBLIC_CLIENT_API_KEY ?? "";

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_CLIENT_API_KEY is not set");
}

export default function Home() {
  const [order, setOrder] = useState<{
    orderId: string;
    clientSecret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createOrder("1", "test@crossmint.com", "HkuqRgeLTz1t384Z3fKv8f4fJZKLCTghX5Tq6WzPyyuZ")
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p>{error}</p>;
  if (!order) return <p>Creating order...</p>;

  return (
    <CrossmintProvider apiKey={apiKey}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-[450px] w-full mx-auto">
          <CrossmintEmbeddedCheckout
            orderId={order.orderId}
            clientSecret={order.clientSecret}
            payment={{
              crypto: { enabled: false },
              fiat: {
                enabled: true, allowedMethods: {
                  applePay: true,
                  card: false,
                  googlePay: false,
                }
              },
            }}
            appearance={{
              variables: {
                colors: {
                  backgroundPrimary: "#000000",
                }
              },
              rules: {
                DestinationInput: { display: "hidden" },
                ReceiptEmailInput: { display: "hidden" },
              },
            }}
          />
        </div>
      </div>
    </CrossmintProvider>
  );
}
