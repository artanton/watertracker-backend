import express from "express";
import waterController from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import {isValidId} from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { addWaterSchema } from "../schemas/waterSchemas.js";

  const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.post(
    "/",
    validateBody(addWaterSchema),
    waterController.addWater
  );

  export default contactsRouter;