import { createRouter } from "next-connect";
import constroller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.post(postHandler);

export default router.handler(constroller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  return response.status(201).json(newUser);
}
