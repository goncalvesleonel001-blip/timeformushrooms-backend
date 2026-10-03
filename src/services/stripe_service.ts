import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

/**
 * 1️⃣ Créer un PaymentIntent pour paiement par carte
 */
export async function createStripeCardIntent(
  amount: number,
  currency: string
) {
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
    });

    return intent;
  } catch (error: any) {
    console.error("❌ Erreur createStripeCardIntent:", error);
    throw new Error("Erreur création PaymentIntent Stripe");
  }
}

/**
 * 2️⃣ Confirmer un paiement par carte (Stripe 2024 → confirm + retrieve)
 */
export async function confirmStripeCardPayment(
  intentId: string,
  paymentMethodId: string
) {
  try {
    // 1️⃣ Confirmer le paiement
    await stripe.paymentIntents.confirm(intentId, {
      payment_method: paymentMethodId,
    });

    // 2️⃣ Récupérer l'objet complet (⭐ obligatoire depuis 2024)
    const intent = await stripe.paymentIntents.retrieve(intentId);

    return intent; // ⭐ contient toujours intent.status
  } catch (error: any) {
    console.error("❌ Erreur confirmStripeCardPayment:", error);
    throw new Error("Erreur confirmation paiement Stripe");
  }
}
