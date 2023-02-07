import express from "express" // 3RD PARTY MODULE (npm i express)
import fs from "fs" // CORE MODULE (no need to install it!!!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" //
import { checkBlogSchema, triggerBadRequest } from "./validation.js"
import httpErrors from "http-errors"

const { NotFound, Unauthorized, BadRequest } = httpErrors
const blogsRouter = express.Router()

const blogsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
)

blogsRouter.get("/", (req, res) => {
  const fileContentAsBuffer = fs.readFileSync(blogsJSONPath)
  const blogsArray = JSON.parse(fileContentAsBuffer)
  res.send(blogsArray)
})

blogsRouter.post("/", checkBlogSchema, triggerBadRequest, (req, res) => {
  const { category, title, cover, readTime, author, content } = req.body
  const newBlog = {
    category,
    title,
    cover,
    readTime,
    author,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: uniqid(),
  }
  const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
  blogsArray.push(newBlog)
  fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray))
  res.status(200).send(newBlog)
})

blogsRouter.put("/:id", (req, res) => {
  const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
  const index = blogsArray.findIndex((blog) => blog._id === req.params.id)
  const oldBlog = blogsArray[index]
  const updatedBlog = { ...oldBlog, ...req.body, updatedAt: new Date() }
  blogsArray[index] = updatedBlog
  fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray))
  res.send(updatedBlog)
})

blogsRouter.get("/:id", (req, res) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
    const blog = blogsArray.find((blog) => blog._id === req.params.id)
    if (blog) {
      res.send(blog)
    } else {
      next(NotFound(`Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id", (req, res) => {
  const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
  const remainingBlogs = blogsArray.filter(
    (blog) => blog._id !== req.params.body
  )
  fs.writeFileSync(blogsJSONPath, JSON.stringify(remainingBlogs))

  res.send()
})
export default blogsRouter
