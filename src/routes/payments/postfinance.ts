import express from "express";
import {
  createPostFinanceTransaction,
  confirmPostFinanceTransaction,
} from "../../services/postfinance_service";

const router = express.Router();

/**
 * 1️⃣ Créer une transaction PostFinance
 * Flutter envoie : amount, description
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: "amount et description requis" });
    }

    const transaction = await createPostFinanceTransaction(amount, description);

    return res.json({
      transaction_id: transaction.id,
      qr_code: transaction.qr_code, // QR PostFinance (base64 ou URL)
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("❌ Erreur PostFinance create:", error.message);
    return res.status(500).json({ error: "Erreur création transaction PostFinance" });
  }
});

/**
 * 2️⃣ Confirmer une transaction PostFinance
 * Flutter envoie : transaction_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id requis" });
    }

    const confirmation = await confirmPostFinanceTransaction(transaction_id);

    return res.json({
      status: confirmation.status,
      confirmed_at: confirmation.confirmed_at,
    });
  } catch (error: any) {
    console.error("❌ Erreur PostFinance confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation PostFinance" });
  }
});

export default router;
