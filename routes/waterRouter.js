import express from "express";
import waterController from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import {isValidId} from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { addWaterSchema } from "../schemas/waterSchemas.js";

  const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
    "/",
    validateBody(addWaterSchema),
    waterController.addWater
  );

  waterRouter.get("/:id", isValidId, waterController.today);

  waterRouter.delete("/:id", isValidId, waterController.deleteWaterDose);



  export default waterRouter;