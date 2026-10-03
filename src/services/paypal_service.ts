import axios from "axios";

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID as string;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET as string;
const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * 0️⃣ Récupérer un token OAuth PayPal
 */
async function getPaypalAccessToken(): Promise<string> {
  try {
    const response = await axios({
      url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: PAYPAL_CLIENT,
        password: PAYPAL_SECRET,
      },
      data: "grant_type=client_credentials",
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error("❌ Erreur PayPal OAuth:", error.message);
    throw new Error("Impossible d'obtenir le token PayPal");
  }
}

/**
 * 1️⃣ Créer un ordre PayPal
 */
export async function createPaypalOrder(amount: number, currency: string) {
  try {
    const token = await getPaypalAccessToken();

    const response = await axios({
      url: `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
          },
        ],
      },
    });

    const order = response.data;

    return {
      id: order.id,
      status: order.status,
      approve_link:
        order.links?.find((l: any) => l.rel === "approve")?.href || null,
    };
  } catch (error: any) {
    console.error("❌ Erreur createPaypalOrder:", error.message);
    throw new Error("Erreur création ordre PayPal");
  }
}

/**
 * 2️⃣ Capturer un ordre PayPal
 */
export async function capturePaypalOrder(orderId: string) {
  try {
    const token = await getPaypalAccessToken();

    const response = await axios({
      url: `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = response.data;

    const captureData = capture.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      status: captureData?.status || "UNKNOWN",
      capture_id: captureData?.id || null,
      payer_email: capture.payer?.email_address || null,
    };
  } catch (error: any) {
    console.error("❌ Erreur capturePaypalOrder:", error.message);
    throw new Error("Erreur capture PayPal");
  }
}
