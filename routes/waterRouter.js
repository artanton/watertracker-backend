import express from "express";
import waterController from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { waterSchema, waterRateSchema } from "../schemas/waterSchemas.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
"/add",
validateBody(waterSchema), 
waterController.addWater);

waterRouter.get("/today/:id", isValidId, waterController.today);

waterRouter.delete("/remove/:id", isValidId, waterController.deleteWaterRecord);

waterRouter.patch(
  "/update/:id",
  isValidId,
  validateBody(waterSchema),
  waterController.updateWaterDose
);

waterRouter.get("/month", waterController.month);

waterRouter.patch(
  "/waterrate",
  validateBody(waterRateSchema),
  waterController.dailyNorm
);

export default waterRouter;
