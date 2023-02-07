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
} from "./api/errorHandlers.js"

const server = express() // helps me to create endpoints and api

const port = 3001

const loggerMiddleWare = (req, res, next) => {
  console.log(`Request method ${req.method}--url ${req.url}---${new Date()}`)
  req.author = "May"
  next()
}

server.use(cors())

server.use(loggerMiddleWare)

server.use(express.json()) // If you do not add this line here BEFORE the endpoints, all req.body will be UNDEFINED

// ****************** ENDPOINTS *********************
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
})
server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
)
