import { randomUUID } from "crypto";

interface PixTransaction {
  id: string;
  amount: number;
  description: string;
  qr_code: string;
  status: "pending" | "confirmed";
  created_at: string;
  confirmed_at?: string;
}

const db: Record<string, PixTransaction> = {};

export const createPixTransaction = async (amount: number, description: string) => {
  const id = randomUUID();
  const qr_code = `PIX-${id}-${Date.now()}`;

  db[id] = {
    id,
    amount,
    description,
    qr_code,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  return db[id];
};

export const confirmPixTransaction = async (transaction_id: string) => {
  const tx = db[transaction_id];
  if (!tx) throw new Error("Transaction introuvable");

  tx.status = "confirmed";
  tx.confirmed_at = new Date().toISOString();

  return tx;
};
