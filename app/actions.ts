"use server";

const serverApiKey = process.env.SERVER_API_KEY ?? "";

if (!serverApiKey) {
  throw new Error("SERVER_API_KEY is not set");
}

const env = serverApiKey.startsWith("sk_production") ? "production" : "staging";

const testnetTokenLocator =
  "base-sepolia:0xc845b7acbcfd132f5b60b39a37683ff734231500";
const mainnetTokenLocator =
  "base:0x4ed4e862860bed51a9570b96d89af5e1b0efefed";

const baseUrl = env === "production"
  ? "https://www.crossmint.com"
  : "https://staging.crossmint.com";

const tokenLocator = env === "production"
  ? mainnetTokenLocator
  : testnetTokenLocator;

export async function createOrder(
  amountUsd: string,
  email: string,
  walletAddress: string,
) {
  try {
    const res = await fetch(`${baseUrl}/api/2022-06-09/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": serverApiKey,
      },
      body: JSON.stringify({
        lineItems: {
          tokenLocator,
          executionParameters: {
            mode: "exact-in",
            amount: amountUsd,
          },
        },
        payment: {
          method: "card",
          receiptEmail: email,
        },
        recipient: {
          walletAddress,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? "Failed to create order");
    }
    const {
      clientSecret,
      order: { orderId },
    } = data;
    return {
      orderId,
      clientSecret,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
