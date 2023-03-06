import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs-extra"

const { readJSON, writeJSON, writeFile } = fs

const apiFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../api")
const publicFolderPathAuthors = join(process.cwd(), "./public/img/authors")
const publicFolderPathBlogs = join(process.cwd(), "./public/img/blogPosts")

console.log("ROOT OF THE PROJECT:", process.cwd())
// console.log("PUBLIC FOLDER:", publicFolderPath)

console.log("DATA FOLDER PATH: ", apiFolderPath)
const authorsJSONPath = join(apiFolderPath, "/authors/authors.json")
const blogsJSONPath = join(apiFolderPath, "/Blogs/blogs.json")

export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = (authorsArray) => writeJSON(authorsJSONPath, authorsArray)
export const getBlogs = () => readJSON(blogsJSONPath)
export const writeBlogs = (blogsArray) => writeJSON(blogsJSONPath, blogsArray)

export const saveAuthorsAvatars = (fileName, contentAsABuffer) => writeFile(join(publicFolderPathAuthors, fileName), contentAsABuffer) //use this in tools

export const saveBlogsCover = (fileName, contentAsABuffer) => writeFile(join(publicFolderPathBlogs, fileName), contentAsABuffer)
