// GET /blogPosts => returns the list of blogPosts
// GET /blogPosts /123 => returns a single blogPost
// POST /blogPosts => create a new blogPost
// PUT /blogPosts /123 => edit the blogPost with the given id
// DELETE /blogPosts /123 => delete the blogPost with the given id
import BlogsModal from "../Blogs/modal.js"
import express from "express"

const blogsRouter = express.Router()

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModal(req.body)
    const { _id } = await newBlog.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
