import path, { dirname, extname } from "path"

import { fileURLToPath } from "url"

import fs from "fs"

import multer from "multer"
import { saveAuthorsAvatars, saveBlogsCover } from "../../lib/fs-tools.js"

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const authorDirectory = path.join(__dirname, "../../../public/img/authors")
const blogDirectory = path.join(__dirname, "../../../public/img/blogPosts")

export const parseFile = multer()

export const uploadAuthorAvatar = async (req, res, next) => {
  const { originalname, buffer } = req.file //multer
  const extension = extname(originalname) //ex .jpg .png...
  const fileName = `${req.params.id}${extension}`
  await saveAuthorsAvatars(fileName, buffer)
  const link = `${process.env.BE_HOST}img/authors/${fileName}`
  req.file = link // this is the link I send
  next()
}
export const uploadBlogCover = async (req, res, next) => {
  const { originalname, buffer } = req.file
  const extension = extname(originalname)
  const fileName = `${req.params.id}${extension}`
  await saveBlogsCover(fileName, buffer)
  const link = `${process.env.BE_HOST}img/blogPosts/${fileName}`
  req.file = link
  next()
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
