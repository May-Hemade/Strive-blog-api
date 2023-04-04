import express from "express" // NEW IMPORT SYNTAX (do not forget to add type: "module" to package.json to use this!!)
import listEndpoints from "express-list-endpoints"

import cors from "cors"

import swaggerUi from "swagger-ui-express"
const require = createRequire(import.meta.url) // construct the require method
const swaggerDocument = require("./swagger.json")
import { badRequestHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler } from "./utils/errorHandlers.js"
import path, { dirname, join } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"
import mongoose from "mongoose"
import blogsRouter from "./api/Blogs/indexMongo.js"
import authorsRouter from "./api/authors/indexMongo.js"
import createHttpError from "http-errors"
import passport from "passport"
import googleStrategy from "./lib/auth/google.js"

const server = express() // helps me to create endpoints and api

const port = process.env.PORT || 3001

passport.use("google", googleStrategy)
const loggerMiddleWare = (req, res, next) => {
  console.log(`Request method ${req.method}--url ${req.url}---${new Date()}`)
  req.author = "May"
  next()
} // it writes what the request is

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)
//folder I am in
const publicDirectory = path.join(__dirname, "../public") // joining the folder with the public
console.log(publicDirectory) // puclic directory ??
server.use(loggerMiddleWare) // any request comes to the server passes and writes what the request is and url in consol

server.use(express.json())

const publicFolderPath = join(process.cwd(), "./public") // joining current working directory with the public folder  //// puclic directory ??

console.log(publicFolderPath)
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL] // cors stops anyone any request not in the whitelist

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If current origin is in the whitelist you can move on
      corsNext(null, true)
    } else {
      // If it is not --> error
      corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist!`))
    }
  },
}

server.use(express.static(publicFolderPath))
server.use("/pdf", express.static(publicFolderPath))
server.use(cors(corsOpts))
server.use(passport.initialize())

// ****************** ENDPOINTS *********************
// server.use(express.static(publicDirectory))
server.use("/authors", authorsRouter)
server.use("/blogs", blogsRouter)

// ****************** ERROR HANDLERS ****************
server.use(badRequestHandler) // 400
server.use(unauthorizedHandler) // 401
server.use(notFoundHandler) // 404
server.use(genericErrorHandler) // 500

// server.listen(port, () => {
//   console.table(listEndpoints(server))
//   console.log("Server is running on port:", port)
//   console.log("hey", process.env.BE_HOST)
// })
// server.on("error", (error) =>
//   console.log(`❌ Server is not running due to : ${error}`)
// )

mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
  })
})
