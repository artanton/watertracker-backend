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
    dalyNorma: {
      type: Number,
      min: 50,
      max: 15000,
      default: 2000,
    },
    waterTotal : {
      type : Number,
      min: 0,
      
    },
    persantRate: {
      type: Number,
      min: [0, " value has to be positive"],
      default: 0,
    },

    dailyWaterInfo: {
      type: [
        {
          createdDate: {
            type: Date,
            required: true,
          },
          waterDose: {
            type: Number,
            min: [50, " min value is 50"],
            max: [5000, " max value is 5000"],
            required: true,
            
          },
        },{timestamps: true,}
      ],
    },
  },
  { versionKey: false, timestamps: true }
);
waterSchema.post("save", handleMongooseError);

waterSchema.pre("findOneAndUpdate", setUpdateSettings);

waterSchema.post("findOneAndUpdate", handleMongooseError);

export const Water = model("water", waterSchema);
