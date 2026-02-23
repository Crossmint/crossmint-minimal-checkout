"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CrossmintProvider,
  CrossmintCheckoutProvider,
} from "@crossmint/client-sdk-react-ui";

const apiKey = process.env.NEXT_PUBLIC_CLIENT_API_KEY ?? "";
if (!apiKey) throw new Error("NEXT_PUBLIC_CLIENT_API_KEY is not set");

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CrossmintProvider apiKey={apiKey}>
        <CrossmintCheckoutProvider>{children}</CrossmintCheckoutProvider>
      </CrossmintProvider>
    </QueryClientProvider>
  );
}
