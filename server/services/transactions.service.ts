// utils/transactionLog.ts
import { ITransactionLog, transactionLogZ } from "@/validations";
import { schemaValidationError } from "../error";
import { TransactionLog } from "../models/transactionsLog.model";

export const createTransactionLog = async (body: ITransactionLog) => {
  // Safe Parse for better error handling
  const validData = transactionLogZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const transactionLog = new TransactionLog(validData.data);

    const log = await transactionLog.save();
    console.log("Log: ", log);

    return {
      success: true,
      data: transactionLog,
    };
  } catch (error: any) {
    console.error("Transaction log creation failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};
