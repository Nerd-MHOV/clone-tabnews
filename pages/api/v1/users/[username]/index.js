import { createRouter } from "next-connect";
import constroller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(constroller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;

  const userInputvalues = request.body;
  const updatedUser = await user.update(username, userInputvalues);

  return response.status(200).json(updatedUser);
  
}