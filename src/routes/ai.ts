import { Router, Request, Response } from "express";

import {
  analyzeNature,
  analyzeNatureImage,
  continueNatureConversation,
  testOpenAI,
} from "../services/openai_service";

const router = Router();

/**
 * Test simple de la connexion OpenAI.
 *
 * GET /ai/test
 */
router.get(
  "/test",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const result = await testOpenAI();

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error: unknown) {
      console.error("AI TEST ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue pendant le test OpenAI.";

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  },
);

/**
 * Première analyse.
 *
 * POST /ai/analyze
 *
 * Corps attendu :
 * {
 *   "category": "Champignon",
 *   "description": "Trouvé sous un frêne",
 *   "imageBase64": "..."
 * }
 */
router.post(
  "/analyze",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const category =
        typeof req.body.category === "string"
          ? req.body.category.trim()
          : "";

      const description =
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "";

      const imageBase64 =
        typeof req.body.imageBase64 === "string"
          ? req.body.imageBase64.trim()
          : "";

      if (category.length === 0) {
        res.status(400).json({
          success: false,
          error: "La catégorie est obligatoire.",
        });
        return;
      }

      if (
        description.length === 0 &&
        imageBase64.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "Ajoute une description ou une photo avant de lancer l'analyse.",
        });
        return;
      }

      const result =
        imageBase64.length > 0
          ? await analyzeNatureImage(
              category,
              description,
              imageBase64,
            )
          : await analyzeNature(
              category,
              description,
            );

      res.status(200).json({
        success: true,
        message: result.message,
        responseId: result.responseId,
      });
    } catch (error: unknown) {
      console.error("AI ANALYZE ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue pendant l'analyse.";

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  },
);

/**
 * Suite de la conversation.
 *
 * POST /ai/continue
 *
 * Corps attendu :
 * {
 *   "previousResponseId": "resp_...",
 *   "userMessage": "Le pied est creux",
 *   "imageBase64": "..."
 * }
 */
router.post(
  "/continue",
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const previousResponseId =
        typeof req.body.previousResponseId === "string"
          ? req.body.previousResponseId.trim()
          : "";

      const userMessage =
        typeof req.body.userMessage === "string"
          ? req.body.userMessage.trim()
          : "";

      const imageBase64 =
        typeof req.body.imageBase64 === "string"
          ? req.body.imageBase64.trim()
          : "";

      if (previousResponseId.length === 0) {
        res.status(400).json({
          success: false,
          error:
            "L'identifiant de la conversation est obligatoire.",
        });
        return;
      }

      if (
        userMessage.length === 0 &&
        imageBase64.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "Écris un message ou ajoute une nouvelle photo.",
        });
        return;
      }

      const result =
        await continueNatureConversation(
          previousResponseId,
          userMessage,
          imageBase64.length > 0
            ? imageBase64
            : undefined,
        );

      res.status(200).json({
        success: true,
        message: result.message,
        responseId: result.responseId,
      });
    } catch (error: unknown) {
      console.error("AI CONTINUE ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue pendant la conversation.";

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  },
);

export default router;