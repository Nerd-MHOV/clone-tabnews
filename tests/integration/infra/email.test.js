import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email", () => {
  test("send()", async () => {
    await email.send({
      from: "Nerd <contato@nerd.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de email",
      text: "Olá, este é um teste de email.",
    });
    await email.send({
      from: "Nerd <contato@nerd.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "Olá, este é um teste de email ultimo.",
    });
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Olá, este é um teste de email ultimo.\r\n");
    expect(lastEmail.sender).toBe("<contato@nerd.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
  });
});
