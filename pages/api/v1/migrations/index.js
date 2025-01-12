import migrationsRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method))
    return response.status(405).json({
      error: `Method "${request.method}" Not Allowed`,
    });

  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      console.log("GET /api/v1/migrations");
      const pendingMigrations = await migrationsRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      console.log("POST /api/v1/migrations");
      const migratedMigrations = await migrationsRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0)
        return response.status(201).json(migratedMigrations);

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    dbClient.end();
  }
}

export default migrations;
