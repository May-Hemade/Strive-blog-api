import { AuthorModel, FriendsModel } from "../authors/model.js"
import express from "express"
import { checkAuthorSchema, checkValidationResult } from "./validation.js"

import mongoose from "mongoose"
import createHttpError from "http-errors"
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js"
import { adminOnlyMiddleware } from "../../lib/auth/admin.js"
import { BlogsModel } from "../Blogs/model.js"
import { createAccessToken } from "../../lib/auth/tools.js"
import passport from "passport"
const authorsRouter = express.Router()

authorsRouter.post("/register", async (req, res, next) => {
  try {
    let email = req.body.email
    let foundAuthor = await AuthorModel.findOne({ email })
    console.log("found author", foundAuthor)
    if (!foundAuthor) {
      const author = await new AuthorModel(req.body).save()
      delete author._doc.password
      res.status(201).send(author)
    } else {
      next(createHttpError(400, `email already exists`))
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})
authorsRouter.get("/me/stories", basicAuthMiddleware, async (req, res, next) => {
  try {
    const posts = await BlogsModel.find({ author: req.user._id.toString() })

    res.status(200).send(posts)
  } catch (error) {
    next(error)
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

authorsRouter.get("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }))
// The purpose of this endpoint is to redirect users to Google Consent Screen

authorsRouter.get("/googleRedirect", passport.authenticate("google", { session: false }), async (req, res, next) => {
  console.log(req.user)
  res.redirect(`${process.env.FE_URL}?accessToken=${req.user.accessToken}`)
})

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})
// authorsRouter.put("/:id/friends", async (req, res, next) => {
//   const docA = await FriendsModel.findOneAndUpdate({ requester: UserA, recipient: UserB }, { $set: { status: 1 } }, { upsert: true, new: true })
//   const docB = await FriendsModel.findOneAndUpdate({ recipient: UserA, requester: UserB }, { $set: { status: 2 } }, { upsert: true, new: true })

//   const updateUserA = await AuthorModel.findOneAndUpdate({ _id: UserA }, { $push: { friends: docA._id } })
//   const updateUserB = await AuthorModel.findOneAndUpdate({ _id: UserB }, { $push: { friends: docB._id } })
//   if (userAccepts) {
//     FriendsModel.findOneAndUpdate({ requester: UserA, recipient: UserB }, { $set: { status: 3 } })
//     FriendsModel.findOneAndUpdate({ recipient: UserA, requester: UserB }, { $set: { status: 3 } })
//     res.send()
//   } else if (rejected) {
//     const docA = await FriendsModel.findOneAndRemove({ requester: UserA, recipient: UserB })
//     const docB = await FriendsModel.findOneAndRemove({ recipient: UserA, requester: UserB })
//     const updateUserA = await AuthorModel.findOneAndUpdate({ _id: UserA }, { $pull: { friends: docA._id } })
//     const updateUserB = await AuthorModel.findOneAndUpdate({ _id: UserB }, { $pull: { friends: docB._id } })
//   } else {
//     next(createHttpError(404, `Author with id ${req.params.id} not found!`))
//   }
// })

authorsRouter.post("/addFriend", basicAuthMiddleware, async (req, res, next) => {
  try {
    let recipient = await AuthorModel.findById(req.body.authorId)

    if (recipient) {
      // console.log(recipient.toObject())
      // let foundId = recipient.pendingFriends.find((objId) => objId.toString() === req.user._id)
      let foundId = await AuthorModel.findOne({ pendingFriends: `${req.user._id}` })
      if (foundId) {
        console.log("this is id", foundId)
        next(createHttpError(`request alreay send`))
      } else {
        await AuthorModel.findOneAndUpdate(req.body.authorId, {
          $push: { pendingFriends: req.user._id },
        })

        res.status(201).send(`user with id ${foundId} not found!`)
      }
    } else {
      next(createHttpError(404, `user with id ${req.body.authorId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/me", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
    res.send(updatedAuthor)
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    await AuthorModel.findByIdAndUpdate(req.user._id)
    res.status(204).send()
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

authorsRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain the credentials from req.body
    const { email, password } = req.body

    // 2. Verify the credentials
    const user = await AuthorModel.checkCredentials(email, password)

    if (user) {
      // 3.1 If credentials are fine --> generate an access token (JWT) and send it back as a response
      const payload = { _id: user._id, role: user.role }

      const accessToken = await createAccessToken(payload)
      res.send({ accessToken })
    } else {
      // 3.2 If credentials are NOT fine --> trigger a 401 error
      next(createHttpError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
