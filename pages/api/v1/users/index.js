import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";

const router = createRouter();

router.use(controller.injectAnnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationsToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationsToken);

  return response.status(201).json(newUser);
}
