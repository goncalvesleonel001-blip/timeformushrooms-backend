import express from "express";
import { createMbWayTransaction, confirmMbWayTransaction } from "../../services/mb_way_service";

const router = express.Router();

/**
 * 1️⃣ MB WAY → Créer une transaction
 * Flutter envoie : phone, amount
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "phone et amount requis" });
    }

    const transaction = await createMbWayTransaction(phone, amount);

    return res.json({
      transaction_id: transaction.id,
      mbway_code: transaction.mbway_code, // code envoyé à l'utilisateur
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("❌ Erreur MB WAY create:", error.message);
    return res.status(500).json({ error: "Erreur création transaction MB WAY" });
  }
});

/**
 * 2️⃣ MB WAY → Confirmer une transaction
 * Flutter envoie : transaction_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id requis" });
    }

    const confirmation = await confirmMbWayTransaction(transaction_id);

    return res.json({
      status: confirmation.status,
      confirmed_at: confirmation.confirmed_at,
    });
  } catch (error: any) {
    console.error("❌ Erreur MB WAY confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation MB WAY" });
  }
});

export default router;
