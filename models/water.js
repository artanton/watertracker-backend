import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/handleMongooseError.js";
import { setUpdateSettings } from "../helpers/setUpdateSettings.js";

const waterSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    dailyNorma: {
      type: Number,
      min: 1000,
      max: 15000,
      default: 2000,
    },
    waterTotal: {
      type: Number,
      min: 0,
    },
    persantRate: {
      type: Number,
      min: [0, " value has to be positive"],
      default: 0,
    },

    waterSavings: {
      type: Number,
      min: 0,
      default: 0,
    },

    waterNotes: {
      type: [
        {
          createdDate: {
            type: String,
            required: [true, "createDate was not found"],
          },
          waterDose: {
            type: Number,
            min: [50, " min value is 50"],
            max: [5000, " max value is 5000"],
            required: true,
          },
        },
        { timestamps: true },
      ],
    },
  },
  { versionKey: false, timestamps: true }
);
waterSchema.post("save", handleMongooseError);

waterSchema.pre("findOneAndUpdate", setUpdateSettings);

waterSchema.post("findOneAndUpdate", handleMongooseError);

export const Water = model("water", waterSchema);
