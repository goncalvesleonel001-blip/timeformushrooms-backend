import express from "express";
import { createBizumTransaction, confirmBizumTransaction } from "../../services/bizum_service";

const router = express.Router();

/**
 * 1️⃣ Créer une transaction Bizum
 * Flutter envoie : phone, amount
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "phone et amount requis" });
    }

    const transaction = await createBizumTransaction(phone, amount);

    return res.json({
      transaction_id: transaction.id,
      bizum_code: transaction.bizum_code, // code envoyé à l'utilisateur
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("❌ Erreur Bizum create:", error.message);
    return res.status(500).json({ error: "Erreur création transaction Bizum" });
  }
});

/**
 * 2️⃣ Confirmer une transaction Bizum
 * Flutter envoie : transaction_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id requis" });
    }

    const confirmation = await confirmBizumTransaction(transaction_id);

    return res.json({
      status: confirmation.status,
      confirmed_at: confirmation.confirmed_at,
    });
  } catch (error: any) {
    console.error("❌ Erreur Bizum confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation Bizum" });
  }
});

export default router;
