// import express from "express" // 3RD PARTY MODULE (npm i express)
// import fs from "fs" // CORE MODULE (no need to install it!!!)
// import { fileURLToPath } from "url" // CORE MODULE
// import { dirname, join } from "path" // CORE MODULE
// import uniqid from "uniqid" // 3RD PARTY MODULE (npm i uniqid)
// import multer from "multer"
// import { v2 as cloudinary } from "cloudinary"
// import { CloudinaryStorage } from "multer-storage-cloudinary"
// import { getAuthors, writeAuthors } from "../../lib/fs-tools.js"
// import { parseFile, uploadAuthorAvatar } from "../../utils/upload/index.js"
// import { checkAuthorSchema, triggerBadRequest } from "./validation.js"
// import { sendRegistrationEmail } from "../../lib/emails-tools.js"

import authorsRouter from "./indexMongo"

// // // 1. We gonna start from the current's file path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\index.js
// // console.log("CURRENTS FILE URL: ", import.meta.url)
// // //changes it to a path
// // console.log("CURRENTS FILE PATH: ", fileURLToPath(import.meta.url))
// // // 2. We can obtain the parent's folder path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\
// // console.log("PARENT FOLDER PATH: ", dirname(fileURLToPath(import.meta.url)))
// // // 3. We can concatenate parent's folder path with "users.json" --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\users.json
// // console.log(
// //   "TARGET: ",
// //   join(dirname(fileURLToPath(import.meta.url)), "authors.json")
// // )
// // const authorsJSONPath = join(
// //   dirname(fileURLToPath(import.meta.url)),
// //   "authors.json"
// // )

// const authorsRouter = express.Router()

// authorsRouter.post(
//   "/",
//   checkAuthorSchema,
//   triggerBadRequest,
//   async (req, res, next) => {
//     try {
//       const { name, surname, email, DOB, avatar } = req.body
//       const newAuthor = {
//         name,
//         surname,
//         DOB,
//         email,
//         avatar,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         ID: uniqid(),
//       }
//       // we read our array and i parsed into an array of obj because it was a string
//       //.json text file
//       const authorArray = await getAuthors()

//       let emailExists = authorArray.some(
//         (author) => author.email.toLowerCase() === email.toLowerCase()
//       )
//       if (emailExists) {
//         res.status(400).send({ message: "email already exsits" })
//       } else {
//         authorArray.push(newAuthor)
//         await writeAuthors(authorArray) // We cannot pass an array here as second argument, we shall convert it into a string

//         res.status(201).send(newAuthor)
//       }
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// authorsRouter.post("/checkEmail", async (req, res, next) => {
//   console.log("req body:", req.body)

//   try {
//     let email = req.body.email
//     // we read our array and i parsed into an array of obj because it was a string
//     //.json text file
//     const authorArray = await getAuthors()
//     let emailExists = authorArray.some(
//       (author) => author.email.toLowerCase() === email.toLowerCase()
//     )

//     res.status(201).send({
//       exists: emailExists,
//     })
//   } catch (error) {
//     next(error)
//   }
// })

// authorsRouter.get("/", async (req, res, next) => {
//   try {
//     const authorArray = await getAuthors()
//     console.log("file content2:", authorArray)
//     res.send(authorArray)
//   } catch (error) {
//     next(error)
//   }
// })

// authorsRouter.get("/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id
//     console.log("author id:", id)
//     const authorArray = await getAuthors()
//     const newAuthor = authorArray.find((author) => author.ID === id)
//     res.send(newAuthor)
//   } catch (error) {
//     next(error)
//   }
// })
// authorsRouter.put("/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const authorArray = await getAuthors()
//     const index = authorArray.findIndex((author) => author.ID === id)
//     const oldAuthor = authorArray[index]
//     const updatedAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() }
//     authorArray[index] = updatedAuthor
//     await writeAuthors(authorArray)
//     res.send(updatedAuthor)
//   } catch (error) {
//     next(error)
//   }
// })

// authorsRouter.delete("/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const authorArray = await getAuthors()
//     const remainingAuthors = authorArray.filter((author) => author.ID !== id)
//     await writeAuthors(remainingAuthors)
//     res.send()
//   } catch (error) {
//     next(error)
//   }
// })

// authorsRouter.post(
//   "/:id/avatar",
//   parseFile.single("avatar"),
//   uploadAuthorAvatar,
//   async (req, res, next) => {
//     try {
//       let authorsArray = await getAuthors()

//       let authorIndex = authorsArray.findIndex(
//         (author) => author.ID === req.params.id
//       )
//       if (authorIndex !== -1) {
//         const previousAuthorData = authorsArray[authorIndex]
//         const changedAuthor = {
//           ...previousAuthorData,
//           avatar: req.file,
//           updatedAt: new Date(),
//         }
//         authorsArray[authorIndex] = changedAuthor
//         await writeAuthors(authorsArray)
//         res.send(changedAuthor)
//       } else {
//         res
//           .status(404)
//           .send({ message: `Author with ${req.params.id} is not found!` })
//       }
//     } catch (error) {
//       next(error)
//     }
//   }
// )
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "strive-blog-api/authors",
    },
  }),
}).single("avatar")

// authorsRouter.post(
//   "/:id/avatarCloudinary",
//   cloudinaryUploader,
//   async (req, res, next) => {
//     try {
//       let authors = await getAuthors()

//       const authorIndex = authors.findIndex(
//         (author) => author.ID === req.params.id
//       )
//       if (authorIndex === -1) {
//         res
//           .status(404)
//           .send({ message: `Author with ${req.params.id} is not found!` })
//       }
//       const previousAuthorData = authors[authorIndex]
//       const changedAuthor = {
//         ...previousAuthorData,
//         avatar: req.file.path,
//         updatedAt: new Date(),
//       }
//       authors[authorIndex] = changedAuthor
//       await writeAuthors(authors)
//       res.send(changedAuthor)
//     } catch (error) {
//       res.send(500).send({ message: error.message })
//     }
//   }
// )

// authorsRouter.post("/register", async (req, res, next) => {
//   try {
//     const { email } = req.body
//     await sendRegistrationEmail(email)
//     res.send({ message: "email sent" })
//   } catch (error) {
//     next(error)
//   }
// })

// export default authorsRouter
