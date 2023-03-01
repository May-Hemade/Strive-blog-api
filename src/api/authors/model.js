import mongoose from "mongoose"

const { Schema, model } = mongoose

const authorsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    DOB: { type: Date },
    avatar: { type: String },
  },
  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
)

export default model("User", usersSchema)
