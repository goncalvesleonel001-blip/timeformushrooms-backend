import { randomUUID } from "crypto";

export interface MbWayTransaction {
  id: string;
  phone: string;
  amount: number;
  status: "pending" | "confirmed";
  created_at: string;
  confirmed_at?: string;
}

const db: Record<string, MbWayTransaction> = {};

/**
 * 1️⃣ Créer une transaction MB WAY
 */
export async function createMbWayTransaction(
  phone: string,
  amount: number
): Promise<MbWayTransaction> {
  const id = randomUUID();

  const transaction: MbWayTransaction = {
    id,
    phone,
    amount,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  db[id] = transaction;

  return transaction;
}

/**
 * 2️⃣ Confirmer une transaction MB WAY
 */
export async function confirmMbWayTransaction(
  transactionId: string
): Promise<MbWayTransaction> {
  const transaction = db[transactionId];

  if (!transaction) {
    throw new Error("Transaction MB WAY introuvable");
  }

  transaction.status = "confirmed";
  transaction.confirmed_at = new Date().toISOString();

  return transaction;
}
