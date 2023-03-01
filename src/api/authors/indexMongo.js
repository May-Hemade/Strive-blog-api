// GET /blogPosts => returns the list of blogPosts
// GET /blogPosts /123 => returns a single blogPost
// POST /blogPosts => create a new blogPost
// PUT /blogPosts /123 => edit the blogPost with the given id
// DELETE /blogPosts /123 => delete the blogPost with the given id
import AuthorModel from "../authors/model.js"
import express from "express"
import { checkAuthorSchema, checkValidationResult } from "./validation.js"

import mongoose from "mongoose"
const authorsRouter = express.Router()

authorsRouter.post(
  "/",
  checkAuthorSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const author = await new AuthorModel(req.body).save()
      res.status(201).send(author)
    } catch (error) {
      res.status(500).send({ message: error.message })
    }
  }
)

export default authorsRouter
