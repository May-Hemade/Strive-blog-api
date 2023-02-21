import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const authorSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "name is a mandatory field and needs to be a string!",
    },
  },
  surname: {
    in: ["body"],
    isString: {
      errorMessage: "surname is a mandatory field and needs to be a string!",
    },
  },
  avatar: {
    in: ["body"],
    isString: {
      errorMessage: "avatar is a mandatory field and needs to be a string!",
    },
  },
  email: {
    in: ["body"],
    isString: {
      errorMessage: "email is a mandatory field and needs to be a string!",
    },
  },
}

export const checkAuthorSchema = checkSchema(authorSchema)

export const triggerBadRequest = (req, res, next) => {
  // 1. Check if previous middleware ( checkAuthorSchema) has detected any error in req.body
  const errors = validationResult(req)

  console.log(errors.array())

  if (!errors.isEmpty()) {
    // 2.1 If we have any error --> trigger error handler 400
    next(
      createHttpError(400, "Errors during author validation", {
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
