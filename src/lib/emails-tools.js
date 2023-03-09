import sgMail from "@sendgrid/mail"
import { join } from "path"
import { publicFolderPathBlogs } from "./fs-tools.js"
import fs from "fs-extra"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendRegistrationEmail = async (recipientAddress) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Hello first email sent!",
    text: "Welcome to the blog land",
    html: "<strong>bla bla bla but in bold</strong>",
  }
  let response = await sgMail.send(msg)
  console.log(response[0].statusCode)
  console.log(response[0].headers)
}

export const sendEmailBlog = async (blog) => {
  let pathToAttachment = join(publicFolderPathBlogs, `blog-${blog._id}.pdf`)
  let attachment = fs.readFileSync(pathToAttachment).toString("base64")
  console.log(process.env.SENDGRID_API_KEY)
  const msg = {
    to: "may.hemade1993@gmail.com", //blog.author.email
    from: process.env.SENDER_EMAIL,
    subject: "Hello first email sent!",
    text: "Welcome to the blog land",
    html: "<strong>bla bla bla but in bold</strong>",
    attachments: [
      {
        content: attachment,
        filename: "attachment.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
    link: `http://localhost:3001/blogs/${blog._id}`,
  }
  let response = await sgMail.send(msg)
  console.log(response[0].statusCode)
  console.log(response[0].headers)
}
