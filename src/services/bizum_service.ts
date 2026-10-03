import { randomUUID } from "crypto";

interface BizumTransaction {
  id: string;
  phone: string;
  amount: number;
  bizum_code: string;
  status: "pending" | "confirmed";
  created_at: string;
  confirmed_at?: string;
}

const db: Record<string, BizumTransaction> = {};

export const createBizumTransaction = async (phone: string, amount: number) => {
  const id = randomUUID();
  const bizum_code = Math.floor(100000 + Math.random() * 900000).toString();

  db[id] = {
    id,
    phone,
    amount,
    bizum_code,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  return db[id];
};

export const confirmBizumTransaction = async (transaction_id: string) => {
  const tx = db[transaction_id];
  if (!tx) throw new Error("Transaction introuvable");

  tx.status = "confirmed";
  tx.confirmed_at = new Date().toISOString();

  return tx;
};
