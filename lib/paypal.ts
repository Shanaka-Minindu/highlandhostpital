const base =
  process.env.PAYPAL_API_BASE_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET_KEY) {
    throw new Error("MISSING_API_CREDENTIALS");
  }

  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET_KEY,
  ).toString("base64");

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await handleResponse(response);
  return data.access_token;
}

async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  } else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await getAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price.toString(),
          },
        },
      ],
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // "PayPal-Request-Id": "Optional-Unique-Id"
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await getAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // "PayPal-Request-Id": "Optional-Unique-Id"
      },
    });

    return handleResponse(response);
  },
};
