import webserver from "infra/webserver";
import activation from "models/activation";
import session from "models/session";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all sucessful)", () => {
  let createUserResponseBody;
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@curso.dev",
          password: "validpassword",
        }),
      },
    );
    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponse.status).toBe(201);

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@nerd.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative sua conta");
    expect(lastEmail.text).toContain("Olá, RegistrationFlow!");

    const activationTokenInEmail = orchestrator.extrectUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenInEmail}`,
    );

    const validActivationObject = await activation.findOneValidByToken(
      activationTokenInEmail,
    );

    expect(validActivationObject.user_id).toBe(createUserResponseBody.id);
    expect(validActivationObject.used_at).toBe(null);
  });

  test("Activate account", async () => {});

  test("Login with activated account", async () => {});

  test("Get user informations", async () => {});
});
