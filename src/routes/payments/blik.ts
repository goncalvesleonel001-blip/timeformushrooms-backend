import express from "express";
import { createBlikTransaction, confirmBlikTransaction } from "../../services/blik_service";

const router = express.Router();

/**
 * 1️⃣ Créer une transaction BLIK
 * Flutter envoie : blik_code, amount
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { blik_code, amount } = req.body;

    if (!blik_code || !amount) {
      return res.status(400).json({ error: "blik_code et amount requis" });
    }

    const transaction = await createBlikTransaction(blik_code, amount);

    return res.json({
      transaction_id: transaction.id,
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("❌ Erreur BLIK create:", error.message);
    return res.status(500).json({ error: "Erreur création transaction BLIK" });
  }
});

/**
 * 2️⃣ Confirmer une transaction BLIK
 * Flutter envoie : transaction_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id requis" });
    }

    const confirmation = await confirmBlikTransaction(transaction_id);

    return res.json({
      status: confirmation.status,
      confirmed_at: confirmation.confirmed_at,
    });
  } catch (error: any) {
    console.error("❌ Erreur BLIK confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation BLIK" });
  }
});

export default router;
