import express, {
  Request,
  Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { testOpenAI } from "./services/openai_service";

import stripeWebhook from "./webhooks/stripe_webhook";
import paypalWebhook from "./webhooks/paypal_webhook";

import aiRoutes from "./routes/ai";

import googlePayRoutes from "./routes/payments/google_pay";
import applePayRoutes from "./routes/payments/apple_pay";
import paypalRoutes from "./routes/payments/paypal";
import mbWayRoutes from "./routes/payments/mb_way";
import pixRoutes from "./routes/payments/pix";
import blikRoutes from "./routes/payments/blik";
import bizumRoutes from "./routes/payments/bizum";
import postFinanceRoutes from "./routes/payments/postfinance";
import stripeCardRoutes from "./routes/payments/stripe_card";

console.log(
  "STRIPE KEY LOADED:",
  process.env.STRIPE_SECRET_KEY
    ? "OK"
    : "MISSING",
);

console.log(
  "OPENAI KEY LOADED:",
  process.env.OPENAI_API_KEY
    ? "OK"
    : "MISSING",
);

/**
 * Test OpenAI au démarrage.
 */
testOpenAI()
  .then((response) => {
    console.log("OPENAI TEST:");
    console.log(response);
  })
  .catch((error) => {
    console.error("OPENAI ERROR:");
    console.error(error);
  });

const app = express();

const port =
  Number(process.env.PORT) || 3000;

/**
 * Webhook Stripe.
 *
 * Il doit impérativement rester avant express.json().
 */
app.post(
  "/webhooks/stripe",
  express.raw({
    type: "application/json",
  }),
  stripeWebhook,
);

/**
 * Webhook PayPal.
 */
app.post(
  "/webhooks/paypal",
  express.json(),
  paypalWebhook,
);

/**
 * Middlewares globaux.
 *
 * La taille est augmentée, car une image encodée en base64
 * est envoyée depuis l'application Flutter.
 */
app.use(cors());

app.use(
  express.json({
    limit: "25mb",
  }),
);

/**
 * Routes IA.
 */
app.use(
  "/ai",
  aiRoutes,
);

/**
 * Routes paiements.
 */
app.use(
  "/payments/googlepay",
  googlePayRoutes,
);

app.use(
  "/payments/applepay",
  applePayRoutes,
);

app.use(
  "/payments/paypal",
  paypalRoutes,
);

app.use(
  "/payments/mbway",
  mbWayRoutes,
);

app.use(
  "/payments/pix",
  pixRoutes,
);

app.use(
  "/payments/blik",
  blikRoutes,
);

app.use(
  "/payments/bizum",
  bizumRoutes,
);

app.use(
  "/payments/postfinance",
  postFinanceRoutes,
);

app.use(
  "/payments/stripecard",
  stripeCardRoutes,
);

/**
 * Health Check.
 */
app.get(
  "/",
  (
    req: Request,
    res: Response,
  ) => {
    res.json({
      status: "Backend running",
      openai: Boolean(
        process.env.OPENAI_API_KEY,
      ),
    });
  },
);

/**
 * Lancement du serveur.
 */
app.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `🚀 Backend TimeForMushrooms lancé sur le port ${port}`,
    );
  },
);