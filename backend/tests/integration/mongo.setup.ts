import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
}

export async function clearTestDB() {
  const collections =
    mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map(
      (collection) =>
        collection.deleteMany({})
    )
  );
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
}