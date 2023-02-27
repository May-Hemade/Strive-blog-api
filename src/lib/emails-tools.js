import sgMail from "@sendgrid/mail"
import { publicFolderPathBlogs } from "./fs-tools.js"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
export const sendRegistrationEmail = async (recipientAddress) => {
  const msg = {
    to: "binoprod@gmail.com",
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
  let pathToAttachment = join(publicFolderPathBlogs, "attachment.pdf")
  let attachment = fs.readFileSync(pathToAttachment).toString("base64")

  const msg = {
    to: blog.author.email,
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
  }
  let response = await sgMail.send(msg)
  console.log(response[0].statusCode)
  console.log(response[0].headers)
}
