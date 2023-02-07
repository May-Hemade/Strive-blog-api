import express from "express" // 3RD PARTY MODULE (npm i express)
import fs from "fs" // CORE MODULE (no need to install it!!!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE (npm i uniqid)

// 1. We gonna start from the current's file path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\index.js
console.log("CURRENTS FILE URL: ", import.meta.url)
//changes it to a path
console.log("CURRENTS FILE PATH: ", fileURLToPath(import.meta.url))
// 2. We can obtain the parent's folder path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\
console.log("PARENT FOLDER PATH: ", dirname(fileURLToPath(import.meta.url)))
// 3. We can concatenate parent's folder path with "users.json" --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\users.json
console.log(
  "TARGET: ",
  join(dirname(fileURLToPath(import.meta.url)), "authors.json")
)
const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
)

const authorsRouter = express.Router()

authorsRouter.post("/", (req, res) => {
  console.log("req body:", req.body)
  const { name, surname, email, DOB, avatar } = req.body
  const newAuthor = {
    name,
    surname,
    DOB,
    email,
    avatar,
    createdAt: new Date(),
    updatedAt: new Date(),
    ID: uniqid(),
  }
  // we read our array and i parsed into an array of obj because it was a string
  //.json text file
  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))

  let emailExists = authorArray.some(
    (author) => author.email.toLowerCase() === email.toLowerCase()
  )
  if (emailExists) {
    res.status(400).send({ message: "email already exsits" })
  } else {
    authorArray.push(newAuthor)
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorArray)) // We cannot pass an array here as second argument, we shall convert it into a string

    res.status(201).send(newAuthor)
  }
})

authorsRouter.post("/checkEmail", (req, res) => {
  console.log("req body:", req.body)

  let email = req.body.email
  // we read our array and i parsed into an array of obj because it was a string
  //.json text file
  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  let emailExists = authorArray.some(
    (author) => author.email.toLowerCase() === email.toLowerCase()
  )

  res.status(201).send({
    exists: emailExists,
  })
})

authorsRouter.get("/", (req, res) => {
  const fileContentAsBuffer = fs.readFileSync(authorsJSONPath)
  console.log("file content:", fileContentAsBuffer)
  const authorArray = JSON.parse(fileContentAsBuffer)
  console.log("file content2:", authorArray)
  res.send(authorArray)
})

authorsRouter.get("/:id", (req, res) => {
  const id = req.params.id
  console.log("author id:", id)
  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const newAuthor = authorArray.find((author) => author.ID === id)
  res.send(newAuthor)
})
authorsRouter.put("/:id", (req, res) => {
  const id = req.params.id
  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const index = authorArray.findIndex((author) => author.ID === id)
  const oldAuthor = authorArray[index]
  const updatedAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() }
  authorArray[index] = updatedAuthor
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorArray))
  res.send(updatedAuthor)
})

authorsRouter.delete("/:id", (req, res) => {
  const id = req.params.id
  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const remainingAuthors = authorArray.filter((author) => author.ID !== id)
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
  res.send()
})
export default authorsRouter
