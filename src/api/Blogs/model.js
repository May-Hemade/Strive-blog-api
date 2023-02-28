import mongoose from "mongoose"

const { Schema, model } = mongoose
const blogsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String },
    readTime: {
      value: { type: Number },
      unit: { type: String },
    },
    comments: [
      {
        authorName: String,
        comment: String,
      },
    ],

    author: {
      name: { type: String },
      avatar: { type: String },
    },
    content: { type: String },
  },
  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
)

export default model("Blog", blogsSchema)
