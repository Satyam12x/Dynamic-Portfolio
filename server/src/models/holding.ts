import mongoose, { Document, Schema } from "mongoose";

export type Exchange = "NSE" | "BSE";

export type Sector =
  | "Financial"
  | "Tech"
  | "Consumer"
  | "Power"
  | "Pipe"
  | "Others";

export interface IStock extends Document {
  name: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  exchange: Exchange;
  sector: Sector;
  yahooSymbol?: string | null;
}

const stockSchema = new Schema<IStock>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    exchangeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    exchange: {
      type: String,
      required: true,
      enum: ["NSE", "BSE"],
    },

    sector: {
      type: String,
      required: true,
      enum: ["Financial", "Tech", "Consumer", "Power", "Pipe", "Others"],
    },
    yahooSymbol: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Stock = mongoose.model<IStock>("Stock", stockSchema);

export default Stock;
