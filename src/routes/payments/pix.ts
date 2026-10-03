import express from "express";
import {
  createPixTransaction,
  confirmPixTransaction,
} from "../../services/pix_service";

const router = express.Router();

/**
 * 1️⃣ Créer une transaction PIX
 * Flutter envoie : amount, description
 */
router.post("/create", async (req: express.Request, res: express.Response) => {
  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: "amount et description requis" });
    }

    const transaction = await createPixTransaction(amount, description);

    return res.json({
      transaction_id: transaction.id,
      qr_code: transaction.qr_code, // string base64 ou URL
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("❌ Erreur PIX create:", error.message);
    return res.status(500).json({ error: "Erreur création transaction PIX" });
  }
});

/**
 * 2️⃣ Confirmer une transaction PIX
 * Flutter envoie : transaction_id
 */
router.post("/confirm", async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id requis" });
    }

    const confirmation = await confirmPixTransaction(transaction_id);

    return res.json({
      status: confirmation.status,
      confirmed_at: confirmation.confirmed_at,
    });
  } catch (error: any) {
    console.error("❌ Erreur PIX confirm:", error.message);
    return res.status(500).json({ error: "Erreur confirmation PIX" });
  }
});

export default router;
