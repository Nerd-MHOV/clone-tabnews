import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnnonymousOrUser);
router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  const userTryingToRequest = request.context.user;
  const securetOutputValues = authorization.filterOutput(
    userTryingToRequest,
    "read:migration",
    pendingMigrations,
  );
  return response.status(200).json(securetOutputValues);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();

  const userTryingToRequest = request.context.user;
  const securetOutputValues = authorization.filterOutput(
    userTryingToRequest,
    "read:migration",
    migratedMigrations,
  );

  if (migratedMigrations.length > 0)
    return response.status(201).json(securetOutputValues);
  return response.status(200).json(securetOutputValues);
}
