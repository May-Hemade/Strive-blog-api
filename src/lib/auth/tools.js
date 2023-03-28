import jwt from "jsonwebtoken"

export const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

// export const createAccessToken = async (payload) => {
//   try {
//     const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" })
//     const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: "30d" })

//     return Promise.resolve({ accessToken, refreshToken })
//   } catch (err) {
//     return Promise.reject(err)
//   }
// }

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) reject(err)
      else resolve(originalPayload)
    })
  )

// export const verifyAccessToken = async (token) => {
//     try {
//       const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" })
//       const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: "30d" })

//       return Promise.resolve({ accessToken, refreshToken })
//     } catch (err) {
//       return Promise.reject(err)
//     }
//   }
