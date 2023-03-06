import express from "express"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const filesRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "strive-blog/authors",
    },
  }),
}).single("avatar")
