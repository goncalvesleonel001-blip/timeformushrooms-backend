import express from "express";
import { testOpenAI } from "../../services/openai_service";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await testOpenAI();

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Erreur OpenAI",
    });
  }
});

export default router;