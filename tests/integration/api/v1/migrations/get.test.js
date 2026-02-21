import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se o usuário tem a feature: read:migration",
        message: "Você não tem permissão para acessar esse recurso",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Running pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se o usuário tem a feature: read:migration",
        message: "Você não tem permissão para acessar esse recurso",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("Running pending migrations with `read:migration` feature", async () => {
      const createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:migration"]);
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
