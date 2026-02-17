import { createRouter } from "next-connect";
import constroller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import controller from "infra/controller";

const router = createRouter();

router.post(postHandler);

export default router.handler(constroller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}
