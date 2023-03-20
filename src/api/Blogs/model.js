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
    comments: { default: [], type: [CommentSchema] },
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
      path: "author",
      select: "name surname avatar",
    })
    .populate({
      path: "likes",
      select: "name",
    })

  return { total, blogs }
})

blogsSchema.static("findBlogWithAuthor", async function (query, id) {
  const total = await this.countDocuments(query.creteria)

  const blog = await this.find({ _id: id }, query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort)

    .populate({
      path: "author",
      select: "name surname avatar",
    })
    .populate({
      path: "likes",
      select: "name",
    })
  return blog
})

let BlogsModel = model("Blog", blogsSchema)
let CommentsModel = model("Comment", CommentSchema)

export { BlogsModel, CommentsModel }
