import express from "express";
import {
  createStripeCardIntent,
  confirmStripeCardPayment,
} from "../../services/stripe_service";

const router = express.Router();

/**
 * 1️⃣ Créer un PaymentIntent pour paiement par carte
 * Flutter envoie : amount, currency
 */
router.post("/create-intent", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "amount et currency requis" });
    }

    const intent = await createStripeCardIntent(amount, currency);

    return res.json({
      client_secret: intent.client_secret,
      intent_id: intent.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Stripe Card create-intent:", error.message);
    return res.status(500).json({ error: "Erreur création PaymentIntent" });
  }
});

/**
 * 2️⃣ Confirmer un paiement par carte
 * Flutter envoie : payment_method_id, intent_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { payment_method_id, intent_id } = req.body;

    if (!payment_method_id || !intent_id) {
      return res.status(400).json({ error: "payment_method_id et intent_id requis" });
    }

    const payment = await confirmStripeCardPayment(intent_id, payment_method_id);

    return res.json({
      status: payment.status,
      payment_id: payment.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur Stripe Card confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation paiement Stripe Card" });
  }
});

export default router;
