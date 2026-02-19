import database from "infra/database";
import email from "infra/email";
import { ForbiddenError, NotFoundError } from "infra/errors";
import webserver from "infra/webserver";
import user from "models/user";
import authorization from "models/authorization";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);

  return activatedUser;
}

async function markTokenAsUsed(token) {
  const usedToken = await runUpdateQuery(token);
  if (!usedToken) return null;

  return usedToken;

  async function runUpdateQuery(token) {
    const result = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = NOW(),
          updated_at = NOW()
        WHERE
          id = $1 
        RETURNING
          *
      ;`,
      values: [token],
    });

    return result.rows[0];
  }
}

async function findOneValidByToken(token) {
  const activationToken = await runSelectQuery(token);

  return activationToken;

  async function runSelectQuery(token) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      ;`,
      values: [token],
    });

    if (result.rows.length === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return result.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);

  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Nerd <contato@nerd.com.br>",
    to: user.email,
    subject: "Ative sua conta",
    text: `Olá, ${user.username}! 

Para ativar sua conta, clique no link a seguir: 

${webserver.origin}/cadastro/ativar/${activationToken.id}

atenciosamente,
Equipe Nerd
`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  EXPIRATION_IN_MILLISECONDS,
  findOneValidByToken,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
