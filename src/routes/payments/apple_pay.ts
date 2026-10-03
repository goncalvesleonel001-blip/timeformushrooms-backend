import express from "express";
import Stripe from "stripe";

const router = express.Router();

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

/**
 * 1️⃣ Apple Pay → Create PaymentIntent
 * Flutter envoie : amount, currency
 */
router.post("/create-intent", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "amount et currency requis" });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"], // Apple Pay passe par Stripe Card
    });

    return res.json({
      client_secret: intent.client_secret,
      intent_id: intent.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Apple Pay create-intent:", error.message);
    return res.status(500).json({ error: "Erreur création PaymentIntent" });
  }
});

/**
 * 2️⃣ Apple Pay → Confirm PaymentIntent
 * Flutter envoie : token Apple Pay
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { token, intent_id } = req.body;

    if (!token || !intent_id) {
      return res.status(400).json({ error: "token et intent_id requis" });
    }

    const payment = await stripe.paymentIntents.confirm(intent_id, {
      payment_method_data: {
        type: "card",
        card: { token },
      },
    });

    return res.json({
      status: payment.status,
      payment_id: payment.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Apple Pay confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation paiement" });
  }
});

export default router;
