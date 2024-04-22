import express from "express";
import waterController from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { waterSchema, waterRateSchema } from "../schemas/waterSchemas.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
"/",
validateBody(waterSchema), 
waterController.addWater);

waterRouter.get("/:id", isValidId, waterController.today);

waterRouter.delete("/:id", isValidId, waterController.deleteWaterRecord);

waterRouter.patch(
  "/:id",
  isValidId,
  validateBody(waterSchema),
  waterController.updateWaterDose
);

waterRouter.get("/", waterController.month);

waterRouter.patch(
  "/",
  validateBody(waterRateSchema),
  waterController.dailyNorm
);

export default waterRouter;
