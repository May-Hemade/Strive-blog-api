import imageToBase64 from "image-to-base64"
import PdfPrinter from "pdfmake"

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
      { text: blog.content ? blog.content.text : "", style: "subheader" },
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

// ${response.headers.get('content-type')
