import path, { dirname, extname } from "path"

import { fileURLToPath } from "url"

import fs from "fs"

import multer from "multer"

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const authorDirectory = path.join(__dirname, "../../../public/img/authors")
const blogDirectory = path.join(__dirname, "../../../public/img/blogPosts")

export const parseFile = multer()

export const uploadAuthorAvatar = (req, res, next) => {
  upload(authorDirectory, req, next)
}
export const uploadBlogCover = (req, res, next) => {
  upload(blogDirectory, req, next)
}

const upload = (dir, req, next) => {
  try {
    const { originalname, buffer } = req.file
    const extension = extname(originalname)
    const fileName = `${req.params.id}${extension}`
    const pathToFile = path.join(dir, fileName)
    fs.writeFileSync(pathToFile, buffer)
    const link = `${process.env.BE_HOST}${fileName}`
    req.file = link
    next()
  } catch (error) {
    next(error)
  }
}
