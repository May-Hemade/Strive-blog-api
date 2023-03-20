import AuthorModel from "../authors/model.js"
import express from "express"
import { checkAuthorSchema, checkValidationResult } from "./validation.js"

import mongoose from "mongoose"
import createHttpError from "http-errors"
const authorsRouter = express.Router()

authorsRouter.post("/", checkAuthorSchema, checkValidationResult, async (req, res, next) => {
  try {
    const author = await new AuthorModel(req.body).save()
    res.status(201).send(author)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.id)
    if (author) {
      res.send(author)
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
}) /// because of uuid not same number so it will give an error

authorsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
}) /// because of uuid not same number so it will give an error

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorModel.findByIdAndDelete(req.params.id)
    if (deletedAuthor) {
      res.status(204).send(deletedAuthor)
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
