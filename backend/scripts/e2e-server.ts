import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

async function startE2EServer() {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4001";
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.JWT_SECRET = "flowday-e2e-test-secret";

  const mongoServer =
    await MongoMemoryServer.create();

  process.env.MONGODB_URI =
    mongoServer.getUri("flowday_e2e");

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  const { server } =
    await import("../src/server.js");

  const port = Number(
    process.env.PORT
  );

  server.listen(port, () => {
    console.log(
      `FlowDay E2E backend running on http://localhost:${port}`
    );
  });

  async function shutdown() {
    try {
      if (server.listening) {
        await new Promise<void>(
          (resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          }
        );
      }

      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (error) {
      console.error(
        "E2E backend shutdown error:",
        error
      );
    } finally {
      process.exit(0);
    }
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startE2EServer().catch((error) => {
  console.error(
    "Failed to start E2E backend:",
    error
  );

  process.exit(1);
});