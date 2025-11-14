import password from "models/password";
import user from "models/user";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("with nonexistent `username`", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentusername",
        {
          method: "PATCH",
        },
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

    test("with duplicated `username`", async () => {
      const user1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user1",
          email: "user1@nerd.com",
          password: "Senha123",
        }),
      });

      expect(user1.status).toBe(201);

      const user2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user2",
          email: "user2@nerd.com",
          password: "Senha123",
        }),
      });

      expect(user2.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const response2Body = await response.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está em uso.",
        action: "Utilize outro nome de usuário para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("with duplicated `email`", async () => {
      const user1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email1",
          email: "email1@nerd.com",
          password: "Senha123",
        }),
      });

      expect(user1.status).toBe(201);

      const user2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email2",
          email: "email2@nerd.com",
          password: "Senha123",
        }),
      });

      expect(user2.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "email1@nerd.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const response2Body = await response.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está em uso.",
        action: "Utilize outro email para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("with unique `username`", async () => {
      const aUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueuser",
          email: "uniqueuser@nerd.com",
          password: "Senha123",
        }),
      });

      expect(aUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueuser",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "uniqueuserupdated",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuserupdated",
        email: "uniqueuser@nerd.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with unique `email`", async () => {
      const aUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueemail",
          email: "uniqueemail@nerd.com",
          password: "Senha123",
        }),
      });

      expect(aUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemail",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "uniqueemailupdated@nerd.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueemail",
        email: "uniqueemailupdated@nerd.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("with new `password`", async () => {
      const aUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "newpassword",
          email: "newpassword@nerd.com",
          password: "Senha123",
        }),
      });

      expect(aUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newpassword",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "newpasswordupdated",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newpassword",
        email: "newpassword@nerd.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);


      const userInDatabase = await user.findOneByUsername("newpassword");
      const correctPasswordMatch = await password.compare('newpasswordupdated', userInDatabase.password);
      const incorrectPasswordMatch = await password.compare('Senha123', userInDatabase.password);
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
