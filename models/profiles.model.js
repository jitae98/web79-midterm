import { model, Schema } from "mongoose";

const ProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    fullName: String,
    dateOfBirth: Date,
    placeOfBirth: String,
    nationality: String,
    education: [
      {
        school: String,
        degree: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    skills: [String],
    projects: [
      {
        name: String,
        description: String,
        role: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    workExperience: [
      {
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    hobbies: [String],
    goals: [String],
  },
  {
    timestamps: true,
  }
);

const ProfileModel = model("profiles", ProfileSchema);

export default ProfileModel;
