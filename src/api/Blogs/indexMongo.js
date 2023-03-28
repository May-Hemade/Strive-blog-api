import { BlogsModel } from "./model.js"
import express from "express"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import * as fastCsv from "fast-csv"
// import createCsvWriter from ('csv-writer').createArrayCsvWriter;
import csvWriter from "csv-writer"
import { stringify } from "csv-stringify/sync"
import { Transform } from "json2csv"
import { pipeline } from "stream"
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js"

const blogsRouter = express.Router()

blogsRouter.post("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new BlogsModel({ ...req.body, author: req.user._id })
    const newblog = await newBlog.save()
    res.status(201).send(newblog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const blogs = await BlogsModel.findBlogWithAuthors(mongoQuery)
    // .sort({
    //   title: -1,
    // })
    // .populate({
    //   path: "author",
    //   select: "name surname avatar",
    // })
    // .populate({
    //   path: "likes",
    //   select: "name",
    // })

    const total = await BlogsModel.countDocuments(mongoQuery.criteria)
    // no matter the order of usage of these methods, Mongo will ALWAYS apply SORT then SKIP then LIMIT
    res.send(
      blogs
      // links: mongoQuery.links("http://localhost:3001/blogs", total),
      // total,
      // numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      // blogs,
    )
    // res.send(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/blogsCSV", (req, res, next) => {
  try {
    const blogCursor = BlogsModel.find().cursor()

    const transformer = (doc) => {
      return {
        Id: doc._id,
        Category: doc.category,
        Name: doc.name,
        title: doc.title,
      }
    }

    const filename = "export.csv"

    res.setHeader("Content-disposition", `attachment; filename=${filename}`)
    res.writeHead(200, { "Content-Type": "text/csv" })

    res.flushHeaders()

    let csvStream = fastCsv.format({ headers: true }).transform(transformer)
    blogCursor.pipe(csvStream).pipe(res)
    console.log("CSV file created successfully")
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/csv2", (req, res) => {
  try {
    const readablestream = BlogsModel.find().cursor({ transform: JSON.stringify })

    const csvFields = ["_id", "title", "category", "name", "createdAt", "updatedAt"]
    const csv = new Transform({ fields: csvFields })

    res.setHeader("Content-disposition", "attachment; filename=experiences.csv")
    res.set("Content-Type", "text/csv")

    pipeline(readablestream, csv, res, (err) => {
      if (err) next(err)
    })
  } catch (e) {
    console.log(e)
  }
})

// blogsRouter.get("/blogsCSV", async (req, res, next) => {
//   try {
//     const blogs = await BlogsModel.find().lean()

//     // Write the data to a CSV string
//     const csvString = await new Promise((resolve, reject) => {
//       stringify(blogs, { header: true }, (err, output) => {
//         if (err) reject(err)
//         else resolve(output)
//       })
//     })

//     // Set the headers to force the file to download
//     res.setHeader("Content-Disposition", "attachment; filename=example.csv")
//     res.setHeader("Content-Type", "text/csv")

//     // Send the CSV string to the client
//     res.send(csvString)

//     console.log("CSV file created successfully")
//   } catch (error) {
//     next(error)
//   }
// })

blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.id)

    if (blog) {
      const blogObj = blog.toObject()
      let numberLikes = blogObj.likes.length
      blogObj.likes = numberLikes

      res.send(blogObj)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/likes", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const blog = await BlogsModel.findBlogWithAuthor(mongoQuery, req.params.id)
    const total = await BlogsModel.countDocuments(mongoQuery.criteria)
    // no matter the order of usage of these methods, Mongo will ALWAYS apply SORT then SKIP then LIMIT
    res.send({
      links: mongoQuery.links("http://localhost:3001/blogs", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      blog,
    })
    if (blog) {
      res.send(blog.likes)
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
      let comment = blog.comments.find((comment) => comment._id.toString() === req.params.commentId)

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
      let commentIndex = blog.comments.findIndex((comment) => comment._id.toString() === req.params.commentId)

      if (commentIndex !== -1) {
        blog.comments[commentIndex] = {
          ...blog.comments[commentIndex].toObject(),
          ...req.body,
        }
        await blog.save()
        res.send(blog.comments[commentIndex])
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

blogsRouter.put("/:id/like", async (req, res, next) => {
  try {
    const { authorID } = req.body
    const isLiked = await BlogsModel.findOne({
      _id: req.params.id,
      likes: authorID,
    })
    if (isLiked) {
      await BlogsModel.findByIdAndUpdate(req.params.id, {
        $pull: { likes: authorID },
      })
      res.send("Unliked")
    } else {
      await BlogsModel.findByIdAndUpdate(req.params.id, {
        $push: { likes: authorID },
      })
      res.send("liked")
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

blogsRouter.delete("/:id/comments/:commentId", async (req, res, next) => {
  try {
    let blog = await BlogsModel.findByIdAndUpdate(req.params.id, { $pull: { comment: { _id: req.params.commentId } } }, { new: true })
    if (blog) {
      res.send(blog)
    } else {
      next(createHttpError(404, `comment with id ${req.params.commentId} not found!`))
    }
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

blogsRouter.post(
  "/:id/uploadCoverCloudinary",
  cloudinaryUploader,

  async (req, res, next) => {
    try {
      let blogs = await getBlogs()

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
      res.send(500).send({ message: error.message })
    }
  }
)

blogsRouter.post("/:id/uploadCoverCloudinary", cloudinaryUploader, async (req, res, next) => {
  try {
    const updatedblog = await BlogsModel.findByIdAndUpdate(
      req.params.id, // WHO you want to modify
      { cover: req.file.path }, // HOW you want to modify
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

export default blogsRouter
