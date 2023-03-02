import mongoose from "mongoose"

const { Schema, model } = mongoose

const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    rate: {
      type: Number,
      min: [1, "Rate must be min 1"],
      max: [5, "Rate can be max 5"],
      default: 5,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Authors",
    },
  },
  { timestamps: true }
)

const blogsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String },
    readTime: {
      value: { type: Number },
      unit: { type: String },
    },
    comments: { defualt: [], type: [CommentSchema] },
    likes: {
      default: [],
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Author" }],
    },

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
