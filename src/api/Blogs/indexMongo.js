import BlogsModel from "./model.js"
import express from "express"
import createHttpError from "http-errors"

const blogsRouter = express.Router()

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body)
    const newblog = await newBlog.save()
    res.status(201).send(newblog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find().skip(2).limit(5).sort({
      title: -1,
    })

    res.send(blogs)
  } catch (error) {
    next(error)
  }
})
blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.id)
    // const blogs = await BlogsModal.find()
    // const blog = blogs.filter((blog) => blog._id === req.params.id)

    if (blog) {
      res.send(blog)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedblog = await BlogsModel.findByIdAndUpdate(
      req.params.id, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // options. By default findByIdAndUpdate returns the record pre-modification. If you want to get back the newly updated record you shall use new:true
      // By default validation is off in the findByIdAndUpdate --> runValidators:true
    )
    if (updatedblog) {
      res.send(updatedblog)
    } else {
      next(createHttpError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedBlog = await BlogsModel.findByIdAndDelete(req.params.id)

    if (deletedBlog) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.id)
    console.log(blog)
    if (blog) {
      const commentToInsert = { ...req.body }
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: commentToInsert } },
        { new: true, runValidators: true }
      )
      if (updatedBlog) {
        res.send(updatedBlog)
      } else {
        next(createHttpError(404, `blog with id ${req.params.id} not found!`))
      }
    } else {
      next(createHttpError(404, ` not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    let blog = await BlogsModel.findById(req.params.id)
    if (blog) {
      res.send(blog.comments)
    } else {
      next(createHttpError(404, "not found"))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    let blog = await BlogsModel.findById(req.params.id)
    if (blog) {
      let comment = blog.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      )

      if (comment) {
        res.send(comment)
      } else {
        next(createHttpError(404, "comment not found"))
      }
    } else {
      next(createHttpError(404, "not found"))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:id/comments/:commentId", async (req, res, next) => {
  try {
    let blog = await BlogsModel.findById(req.params.id)
    if (blog) {
      let commentIndex = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      )

      if (commentIndex !== -1) {
        blog.comments[commentIndex] = {
          ...blog.comments[commentIndex].toObject(),
          ...req.body,
        }
        await blog.save()
        res.send(blog)
      } else {
        next(createHttpError(404, "comment not found"))
      }
    } else {
      next(createHttpError(404, "not found"))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id/comments/:commentId", async (req, res, next) => {
  try {
    let blog = await BlogsModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comment: { _id: req.params.commentId } } },
      { new: true }
    )
    if (blog) {
      res.send(blog)
    } else {
      next(
        createHttpError(
          404,
          `comment with id ${req.params.commentId} not found!`
        )
      )
    }
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
