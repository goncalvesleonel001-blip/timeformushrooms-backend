import express from "express";

const router = express.Router();

/**
 * Webhook PayPal
 * PayPal envoie des événements JSON signés via "Transmission-Sig"
 */
router.post(
  "/",
  async (req: express.Request, res: express.Response) => {
    try {
      const event = req.body;

      if (!event || !event.event_type) {
        return res.status(400).json({ error: "Événement PayPal invalide" });
      }

      console.log("📌 Webhook PayPal reçu:", event.event_type);

      switch (event.event_type) {
        case "PAYMENT.CAPTURE.COMPLETED":
          console.log("✔ Paiement PayPal capturé:", event.resource?.id);
          break;

        case "PAYMENT.CAPTURE.DENIED":
          console.log("❌ Paiement PayPal refusé:", event.resource?.id);
          break;

        case "PAYMENT.CAPTURE.REFUNDED":
          console.log("↩️ Remboursement PayPal:", event.resource?.id);
          break;

        case "CHECKOUT.ORDER.APPROVED":
          console.log("🧾 Commande PayPal approuvée:", event.resource?.id);
          break;

        default:
          console.log("📌 Événement PayPal non géré:", event.event_type);
          break;
      }

      return res.json({ received: true });
    } catch (error: any) {
      console.error("Erreur webhook PayPal:", error.message);
      return res.status(500).json({ error: "Erreur webhook PayPal" });
    }
  }
);

export default router;
