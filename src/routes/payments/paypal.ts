import express from "express";
import { createPaypalOrder, capturePaypalOrder } from "../../services/paypal_service";

const router = express.Router();

/**
 * 1️⃣ PayPal → Créer un ordre
 * Flutter envoie : amount, currency
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "amount et currency requis" });
    }

    const order = await createPaypalOrder(amount, currency);

    return res.json({
      order_id: order.id,
      status: order.status,
      approve_link: order.approve_link,
    });
  } catch (error: any) {
    console.error("❌ Erreur PayPal create:", error.message);
    return res.status(500).json({ error: "Erreur création ordre PayPal" });
  }
});

/**
 * 2️⃣ PayPal → Capturer un ordre
 * Flutter envoie : order_id
 */
router.post("/capture", async (req: express.Request, res: express.Response) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "order_id requis" });
    }

    const capture = await capturePaypalOrder(order_id);

    return res.json({
      status: capture.status,
      capture_id: capture.capture_id,
      payer_email: capture.payer_email,
    });
  } catch (error: any) {
    console.error("❌ Erreur PayPal capture:", error.message);
    return res.status(500).json({ error: "Erreur capture PayPal" });
  }
});

export default router;
