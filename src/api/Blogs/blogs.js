import express from "express" // 3RD PARTY MODULE (npm i express)
import fs from "fs" // CORE MODULE (no need to install it!!!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" //
import {
  checkBlogSchema,
  checkSearchSchema,
  checkValidationResult,
  triggerBadRequest,
} from "./validation.js"
import httpErrors from "http-errors"
import { parseFile, uploadBlogCover } from "../../utils/upload/index.js"

const { NotFound, Unauthorized, BadRequest } = httpErrors
const blogsRouter = express.Router()

const blogsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
)

blogsRouter.get("/", async (req, res, next) => {
  try {
    const fileContentAsBuffer = fs.readFileSync(blogsJSONPath)
    const blogsArray = JSON.parse(fileContentAsBuffer)
    res.send(blogsArray)
  } catch (error) {
    res.send(500).send({ message: error.message })
  }
})

blogsRouter.get(
  "/search",
  checkSearchSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { title } = req.query
      const fileAsBuffer = fs.readFileSync(blogsFilePath)
      const fileAsString = fileAsBuffer.toString()
      const blogsArray = JSON.parse(fileAsString)
      const filtered = blogsArray.filter((blog) =>
        blog.title.toLowerCase().includes(title.toLowerCase())
      )
      res.send(filtered)
    } catch (error) {
      res.send(500).send({ message: error.message })
    }
  }
)

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

blogsRouter.post(
  "/:id/uploadCover",
  parseFile.single("uploadCover"),
  uploadBlogCover,
  async (req, res, next) => {
    try {
      const fileAsBuffer = fs.readFileSync(blogsFilePath)

      const fileAsString = fileAsBuffer.toString()

      let fileAsJSONArray = JSON.parse(fileAsString)

      const blogIndex = fileAsJSONArray.findIndex(
        (blog) => blog._id === req.params.id
      )
      if (blogIndex === -1) {
        res
          .status(404)
          .send({ message: `Blog with ${req.params.id} is not found!` })
        return
      }
      const previousBlogData = fileAsJSONArray[blogIndex]
      const changedBlog = {
        ...previousBlogData,
        cover: req.file,
        updatedAt: new Date(),
        // _id: req.params.id, why??
      }
      fileAsJSONArray[blogIndex] = changedBlog
      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray))
      res.send(changedBlog)
    } catch (error) {
      res.send(500).send({ message: error.message })
    }
  }
)
blogsRouter.post("/:id/comments", (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
    const blog = blogsArray.find((blog) => blog._id === req.params.id)
    const { authorName, comment } = req.body
    console.log(authorName, comment, blog)
    if (blog) {
      if (!blog.comments) {
        blog.comments = []
      }
      const newComment = { authorName, comment }
      blog.comments.push(newComment)
      // console.log(newComment)

      fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray))
      res.status(200).send(newComment)
    } else {
      next(NotFound(`Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {}
})

blogsRouter.get("/:id/comments", (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
    const blog = blogsArray.find((blog) => blog._id === req.params.id)
    if (blog) {
      res.send(blog.comments ? blog.comments : [])
    } else {
      next(NotFound(`Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
