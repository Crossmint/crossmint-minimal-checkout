"use server";

const serverApiKey = process.env.SERVER_API_KEY ?? "";

if (!serverApiKey) {
  throw new Error("SERVER_API_KEY is not set");
}

const env = serverApiKey.startsWith("sk_production") ? "production" : "staging";

const testnetTokenLocator =
  "base-sepolia:0xC845B7ACbcFD132F5b60b39a37683fF734231500";
const mainnetTokenLocator =
  "solana:6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN";

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
