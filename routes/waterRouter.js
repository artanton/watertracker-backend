import express from "express";
import waterController from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  waterSchema,
  waterRateSchema,
  waterUpdateSchema,
} from "../schemas/waterSchemas.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/today", waterController.today);

waterRouter.get("/month", waterController.month);

waterRouter.post("/add", validateBody(waterSchema), waterController.addWater);

waterRouter.patch(
  "/update/:id",
  isValidId,
  validateBody(waterUpdateSchema),
  waterController.updateWaterDose
);

waterRouter.patch(
  "/waterrate",
  validateBody(waterRateSchema),
  waterController.dailyNorm
);

waterRouter.delete("/remove/:id", isValidId, waterController.deleteWaterRecord);

export default waterRouter;
