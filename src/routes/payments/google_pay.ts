import express from "express";
import Stripe from "stripe";

const router = express.Router();

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

/**
 * Google Pay → Create PaymentIntent
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        error: "Missing amount or currency",
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"], // Google Pay passe par Stripe Card
    });

    return res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Google Pay /create :", error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Google Pay → Confirm PaymentIntent
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({
        error: "Missing paymentIntentId or paymentMethodId",
      });
    }

    const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return res.json({
      status: intent.status,
      paymentIntentId: intent.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Google Pay /confirm :", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
