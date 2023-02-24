import imageToBase64 from "image-to-base64"
import PdfPrinter from "pdfmake"
import { pipeline } from "stream"
import { promisify } from "util"
import { getPDFWritableStream } from "./fs-tools.js"

const changeImageType = async (url) => {
  try {
    let imageBase64 = await imageToBase64(url)
    // console.log(imageBase64)
    return imageBase64
  } catch (error) {
    // console.log(error)
    return null
  }
}

export const getPdfReadableStream = async (blog) => {
  const fonts = {
    Courier: {
      normal: "Courier",
      bold: "Courier-Bold",
      italics: "Courier-Oblique",
      bolditalics: "Courier-BoldOblique",
    },
    Helvetica: {
      normal: "Helvetica", //roboto
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  }
  const printer = new PdfPrinter(fonts)
  const blogPdf = {
    content: [
      // blog.map(async(blog)=>{[
      { text: blog.title, style: "header" },
      { text: blog.category, style: "subheader" },
      { text: blog.contet, style: "subheader" },
      {
        image: `data:image/jpeg;base64,${await changeImageType(blog.cover)}`,
        width: 150,
        height: 150,
      },
    ],

    defaultStyle: {
      font: "Helvetica",
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        font: "Courier",
      },
      subheader: {
        fontSize: 15,
        bold: false,
      },
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(blogPdf) // it creates a stream
  pdfReadableStream.end() //to close and end

  return pdfReadableStream
}

export const asyncPDFGeneration = async (blog) => {
  const source = await getPdfReadableStream(blog)
  const destination = getPDFWritableStream(`blog-${blog._id}.pdf`)

  // normally pipeline function works with callbacks to tell when the stream is ended, we shall avoid using callbacks
  // pipeline(source, destination, err => {}) <-- BAD (callback based pipeline)
  // await pipeline(source, destination) <-- GOOD (promise based pipeline)

  // promisify is a (VERY COOL) tool that turns a callback based function (err first callback) into a promise based function
  // since pipeline is an error first callback based function --> we can turn pipeline into a promise based pipeline

  const promiseBasedPipeline = promisify(pipeline)

  await promiseBasedPipeline(source, destination)
}
