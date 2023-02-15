import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const blogSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "category is a mandatory field and needs to be a string!",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title is a mandatory field and needs to be a string!",
    },
  },
  cover: {
    in: ["body"],
    isString: {
      errorMessage: "cover is a mandatory field and needs to be a string!",
    },
  },
}

export const checkBlogSchema = checkSchema(blogSchema)

export const triggerBadRequest = (req, res, next) => {
  // 1. Check if previous middleware ( checksBooksSchema) has detected any error in req.body
  const errors = validationResult(req)

  console.log(errors.array())

  if (!errors.isEmpty()) {
    // 2.1 If we have any error --> trigger error handler 400
    next(
      createHttpError(400, "Errors during blog validation", {
        errorsList: errors.array(),
      })
    )
  } else {
    // 2.2 Else (no errors) --> normal flow (next)
    next()
  }
}

const searchSchema = {
  title: {
    in: ["query"],
    isString: {
      errorMessage:
        "title must be in query and type must be  string to search!",
    },
  },
}

export const checkSearchSchema = checkSchema(searchSchema)

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error("Blog post validation is failed")
    error.status = 400
    error.errors = errors.array()
    next(error)
  }
  next()
}
