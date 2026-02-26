import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URL);
      await client.connect();
    }
    db = client.db(process.env.DB_NAME);
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getCollection(collectionName) {
  const database = await connectToDatabase();
  return database.collection(collectionName);
}
