import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUser(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
      SELECT 
        email
      FROM 
        users
      WHERE 
        LOWER(email) = LOWER($1);
    `,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está em uso.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueUser(username) {
    const results = await database.query({
      text: `
      SELECT 
        username
      FROM 
        users
      WHERE 
        LOWER(username) = LOWER($1);
    `,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O nome de usuário informado já está em uso.",
        action: "Utilize outro nome de usuário para realizar o cadastro.",
      });
    }
  }

  async function runInsertQuery({ username, email, password }) {
    const result = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        *;
    `,
      values: [username, email, password],
    });
    return result.rows[0];
  }
}

const user = { create };

export default user;
