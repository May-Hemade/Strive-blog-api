import express from "express" // NEW IMPORT SYNTAX (do not forget to add type: "module" to package.json to use this!!)
import listEndpoints from "express-list-endpoints"
import authorsRouter from "./api/authors/index.js"
import cors from "cors"
import blogsRouter from "./api/Blogs/blogs.js"
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./utils/errorHandlers.js"
import path, { dirname, join } from "path"
import { fileURLToPath } from "url"
import createHttpError from "http-errors"

const server = express() // helps me to create endpoints and api

const port = 3001

const loggerMiddleWare = (req, res, next) => {
  console.log(`Request method ${req.method}--url ${req.url}---${new Date()}`)
  req.author = "May"
  next()
}

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

// const publicDirectory = path.join(__dirname, "../public")

server.use(loggerMiddleWare)

server.use(express.json())
const publicFolderPath = join(process.cwd(), "./public")

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If current origin is in the whitelist you can move on
      corsNext(null, true)
    } else {
      // If it is not --> error
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist!`)
      )
    }
  },
}

server.use(express.static(publicFolderPath))
server.use(cors(corsOpts))

// If you do not add this line here BEFORE the endpoints, all req.body will be UNDEFINED

// ****************** ENDPOINTS *********************
// server.use(express.static(publicDirectory))
server.use("/authors", authorsRouter)
server.use("/blogs", blogsRouter)

// ****************** ERROR HANDLERS ****************
server.use(badRequestHandler) // 400
server.use(unauthorizedHandler) // 401
server.use(notFoundHandler) // 404
server.use(genericErrorHandler) // 500

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log("Server is running on port:", port)
  console.log("hey", process.env.BE_HOST)
})
server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
)
