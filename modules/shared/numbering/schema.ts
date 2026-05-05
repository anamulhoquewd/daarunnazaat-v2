import { model, models, Schema } from "mongoose";

interface ICounter {
  key: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = models.Counter || model<ICounter>("Counter", CounterSchema);
