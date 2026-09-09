import "dotenv/config";
import mongoose from "mongoose";
import Stock from "./models/holding";

const holdings = [
  {
    name: "HDFC Bank",
    purchasePrice: 1490,
    quantity: 50,
    exchangeCode: "HDFCBANK",
    exchange: "NSE",
    sector: "Financial",
  },
  {
    name: "Bajaj Finance",
    purchasePrice: 6466,
    quantity: 15,
    exchangeCode: "BAJFINANCE",
    exchange: "NSE",
    sector: "Financial",
  },
  {
    name: "ICICI Bank",
    purchasePrice: 780,
    quantity: 84,
    exchangeCode: "532174",
    exchange: "BSE",
    sector: "Financial",
  },
  {
    name: "Bajaj Housing",
    purchasePrice: 130,
    quantity: 504,
    exchangeCode: "544252",
    exchange: "BSE",
    sector: "Financial",
  },
  {
    name: "Savani Financials",
    purchasePrice: 24,
    quantity: 1080,
    exchangeCode: "511577",
    exchange: "BSE",
    sector: "Financial",
  },
  {
    name: "Affle India",
    purchasePrice: 1151,
    quantity: 50,
    exchangeCode: "AFFLE",
    exchange: "NSE",
    sector: "Tech",
  },
  {
    name: "LTI Mindtree",
    purchasePrice: 4775,
    quantity: 16,
    exchangeCode: "LTIM",
    exchange: "NSE",
    sector: "Tech",
  },
  {
    name: "KPIT Tech",
    purchasePrice: 672,
    quantity: 61,
    exchangeCode: "542651",
    exchange: "BSE",
    sector: "Tech",
  },
  {
    name: "Tata Tech",
    purchasePrice: 1072,
    quantity: 63,
    exchangeCode: "544028",
    exchange: "BSE",
    sector: "Tech",
  },
  {
    name: "BLS E-Services",
    purchasePrice: 232,
    quantity: 191,
    exchangeCode: "544107",
    exchange: "BSE",
    sector: "Tech",
  },
  {
    name: "Tanla",
    purchasePrice: 1134,
    quantity: 45,
    exchangeCode: "532790",
    exchange: "BSE",
    sector: "Tech",
  },
  {
    name: "Dmart",
    purchasePrice: 3777,
    quantity: 27,
    exchangeCode: "DMART",
    exchange: "NSE",
    sector: "Consumer",
  },
  {
    name: "Tata Consumer",
    purchasePrice: 845,
    quantity: 90,
    exchangeCode: "532540",
    exchange: "BSE",
    sector: "Consumer",
  },
  {
    name: "Pidilite",
    purchasePrice: 2376,
    quantity: 36,
    exchangeCode: "500331",
    exchange: "BSE",
    sector: "Consumer",
  },
  {
    name: "Tata Power",
    purchasePrice: 224,
    quantity: 225,
    exchangeCode: "500400",
    exchange: "BSE",
    sector: "Power",
  },
  {
    name: "KPI Green",
    purchasePrice: 875,
    quantity: 50,
    exchangeCode: "542323",
    exchange: "BSE",
    sector: "Power",
  },
  {
    name: "Suzlon",
    purchasePrice: 44,
    quantity: 450,
    exchangeCode: "532667",
    exchange: "BSE",
    sector: "Power",
  },
  {
    name: "Gensol",
    purchasePrice: 998,
    quantity: 45,
    exchangeCode: "542851",
    exchange: "BSE",
    sector: "Power",
  },
  {
    name: "Hariom Pipes",
    purchasePrice: 580,
    quantity: 60,
    exchangeCode: "543517",
    exchange: "BSE",
    sector: "Pipe",
  },
  {
    name: "Astral",
    purchasePrice: 1517,
    quantity: 56,
    exchangeCode: "ASTRAL",
    exchange: "NSE",
    sector: "Pipe",
  },
  {
    name: "Polycab",
    purchasePrice: 2818,
    quantity: 28,
    exchangeCode: "542652",
    exchange: "BSE",
    sector: "Pipe",
  },
  {
    name: "Clean Science",
    purchasePrice: 1610,
    quantity: 32,
    exchangeCode: "543318",
    exchange: "BSE",
    sector: "Others",
  },
  {
    name: "Deepak Nitrite",
    purchasePrice: 2248,
    quantity: 27,
    exchangeCode: "506401",
    exchange: "BSE",
    sector: "Others",
  },
  {
    name: "Fine Organic",
    purchasePrice: 4284,
    quantity: 16,
    exchangeCode: "541557",
    exchange: "BSE",
    sector: "Others",
  },
  {
    name: "Gravita",
    purchasePrice: 2037,
    quantity: 8,
    exchangeCode: "533282",
    exchange: "BSE",
    sector: "Others",
  },
  {
    name: "SBI Life",
    purchasePrice: 1197,
    quantity: 49,
    exchangeCode: "540719",
    exchange: "BSE",
    sector: "Others",
  },
];

const seed = async () => {
  try {
    const dbLink = process.env.DB_LINK;

    if (!dbLink) {
      throw new Error("DB_LINK is not defined");
    }

    await mongoose.connect(dbLink);
    console.log("Connected to MongoDB");
    await Stock.deleteMany({});
    const inserted = await Stock.insertMany(holdings);
    const count = await Stock.countDocuments();

    console.log(`Inserted ${inserted.length} holdings`);
    console.log(`Database now contains ${count} holdings`);

    if (count !== holdings.length) {
      throw new Error(`Expected ${holdings.length} holdings, but found ${count}`);
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seed();
