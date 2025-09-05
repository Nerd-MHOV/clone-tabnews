import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("with exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "matchcase",
          email: "matchcase@nerd.com",
          password: "Senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/matchcase",
      );
      expect(response2.status).toBe(200);
      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "matchcase",
        email: "matchcase@nerd.com",
        password: "Senha123",
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });

      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
    });

    test("with case missmatch", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "caseMissmatch",
          email: "caseMissmatch@nerd.com",
          password: "Senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casemissmatch",
      );
      expect(response2.status).toBe(200);
      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "caseMissmatch",
        email: "caseMissmatch@nerd.com",
        password: "Senha123",
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });

      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
    });

    test("with nonexistent username", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentusername",
      );
      expect(response2.status).toBe(404);
      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        statusCode: 404,
      });
    });
  });
});
