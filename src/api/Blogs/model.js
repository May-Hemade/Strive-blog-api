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

    author: { type: mongoose.Types.ObjectId, required: true, ref: "Author" },
    content: { type: String },
  },
  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
)

blogsSchema.static("findBlogWithAuthors", async function (query) {
  const total = await this.countDocuments(query.creteria)

  const blogs = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort)
    .populate({
      path: "authors",
      select: "name surname avatar",
    })
  return { total, blogs }
})

export default model("Blog", blogsSchema)
