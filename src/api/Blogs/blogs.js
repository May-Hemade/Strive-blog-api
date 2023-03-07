import express from "express" // 3RD PARTY MODULE (npm i express)
import fs, { write } from "fs" // CORE MODULE (no need to install it!!!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" //
import { checkBlogSchema, checkSearchSchema, checkValidationResult, triggerBadRequest } from "./validation.js"
import httpErrors from "http-errors"
import { parseFile, uploadBlogCover } from "../../utils/upload/index.js"
import { getBlogs, writeBlogs } from "../../lib/fs-tools.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { getPdfReadableStream } from "../../lib/pdf-tools.js"
import { pipeline } from "stream"
const { NotFound, Unauthorized, BadRequest } = httpErrors
const blogsRouter = express.Router()

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogsArray = await getBlogs()

    let title = req.query.title
    if (title) {
      let specificBlog = blogsArray.filter((blog) => blog.title === title)
      res.send(specificBlog)
    } else {
      res.send(blogsArray)
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/search", checkSearchSchema, checkValidationResult, async (req, res, next) => {
  try {
    const { title } = req.query

    const blogsArray = await getBlogs()
    const filtered = blogsArray.filter((blog) => blog.title.toLowerCase().includes(title.toLowerCase()))
    res.send(filtered)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post("/", checkBlogSchema, triggerBadRequest, async (req, res, next) => {
  try {
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
    const blogsArray = await getBlogs()
    blogsArray.push(newBlog)
    await writeBlogs(blogsArray)
    res.status(200).send(newBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
    const index = blogsArray.findIndex((blog) => blog._id === req.params.id)
    const oldBlog = blogsArray[index]
    const updatedBlog = { ...oldBlog, ...req.body, updatedAt: new Date() }
    blogsArray[index] = updatedBlog
    fs.writeFileSync(blogsJSONPath, JSON.stringify(blogsArray))
    res.send(updatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const blogsArray = await getBlogs()
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

blogsRouter.delete("/:id", (req, res, next) => {
  try {
    const blogsArray = JSON.parse(fs.readFileSync(blogsJSONPath))
    const remainingBlogs = blogsArray.filter((blog) => blog._id !== req.params.body)
    fs.writeFileSync(blogsJSONPath, JSON.stringify(remainingBlogs))

    res.send()
  } catch (error) {
    next(error)
  }
})

blogsRouter.post("/:id/uploadCover", parseFile.single("cover"), uploadBlogCover, async (req, res, next) => {
  try {
    let fileAsJSONArray = await getBlogs()

    const blogIndex = fileAsJSONArray.findIndex((blog) => blog._id === req.params.id)
    if (blogIndex === -1) {
      res.status(404).send({ message: `Blog with ${req.params.id} is not found!` })
      return
    }
    const previousBlogData = fileAsJSONArray[blogIndex]
    const changedBlog = {
      ...previousBlogData,
      cover: req.file,
      updatedAt: new Date(),
    }
    fileAsJSONArray[blogIndex] = changedBlog
    await writeBlogs(fileAsJSONArray)
    res.send(changedBlog)
  } catch (error) {
    next(error)
  }
})

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "strive-blog-api/blogs",
    },
  }),
}).single("cover")

blogsRouter.post("/:id/uploadCoverCloudinary", cloudinaryUploader, async (req, res, next) => {
  try {
    let fileAsJSONArray = await getBlogs()

    const blogIndex = fileAsJSONArray.findIndex((blog) => blog._id === req.params.id)
    if (blogIndex === -1) {
      res.status(404).send({ message: `Blog with ${req.params.id} is not found!` })
      return
    }
    const previousBlogData = fileAsJSONArray[blogIndex]
    const changedBlog = {
      ...previousBlogData,
      cover: req.file.path,
      updatedAt: new Date(),
    }
    fileAsJSONArray[blogIndex] = changedBlog
    await writeBlogs(fileAsJSONArray)
    res.send(changedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const blogsArray = await getBlogs()
    const blog = blogsArray.find((blog) => blog._id === req.params.id)
    const { authorName, comment } = req.body
    console.log(authorName, comment, blog)
    if (blog) {
      if (!blog.comments) {
        blog.comments = [] //initializing an empty array
      }
      const newComment = { authorName, comment }
      blog.comments.push(newComment)
      // console.log(newComment)

      await writeBlogs(blogsArray)
      res.status(200).send(newComment)
    } else {
      next(NotFound(`Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const blogsArray = await getBlogs()
    const blog = blogsArray.find((blog) => blog._id === req.params.id)
    if (blog) {
      res.send(blog.comments ?? [])
    } else {
      next(NotFound(`Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    res.setHeader("Content-Type", "application/pdf")
    const blogs = await getBlogs()
    const blogIndex = blogs.findIndex((blog) => blog._id === req.params.id)
    if (blogIndex === -1) {
      res.status(404).send("blog not found")
    }
    const blog = blogs[blogIndex]
    const source = await getPdfReadableStream(blog) // this pdf stream
    pipeline(source, res, (err) => {
      // the contacts the stream to where it will go
      if (err) console.log(err)
      source.end()
    })
  } catch (error) {
    console.log(error)
  }
})

export default blogsRouter
