import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";
import user from "models/user";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all sucessful)", () => {
  let createUserResponseBody;
  let activationTokenId;
  let createSessionResponseBody;

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

    activationTokenId = orchestrator.extrectUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    const validActivationObject =
      await activation.findOneValidByToken(activationTokenId);

    expect(validActivationObject.user_id).toBe(createUserResponseBody.id);
    expect(validActivationObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationObject = await activationResponse.json();

    expect(Date.parse(activationObject.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual(["create:session", "read:session"]);
  });

  test("Login with activated account", async () => {
    const createSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registration.flow@curso.dev",
          password: "validpassword",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    createSessionResponseBody = await createSessionResponse.json();

    expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
  });

  test("Get user informations", async () => {
    const getUserResponse = await fetch(`http://localhost:3000/api/v1/user/`, {
      headers: {
        Cookie: `session_id=${createSessionResponseBody.token}`,
      },
    });

    expect(getUserResponse.status).toBe(200);
    const getUserResponseBody = await getUserResponse.json();
    expect(getUserResponseBody.id).toBe(createUserResponseBody.id);
  });
});
