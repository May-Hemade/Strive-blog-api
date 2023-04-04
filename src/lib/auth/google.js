import GoogleStrategy from "passport-google-oauth20"
import { AuthorModel } from "../../api/authors/model.js"

import { createAccessToken } from "./tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_HOST}authors/googleRedirect`, // this needs to match EXACTLY with the redirect URL you have configured on Google
  },
  async (_, __, profile, passportNext) => {
    // This function is executed when Google sends us a successfull response
    // Here we are going to receive some informations about the user from Google (scopes --> profile, email)
    try {
      const { email, given_name, family_name } = profile._json

      // 1. Check if the user is already in db
      const user = await AuthorModel.findOne({ email })

      if (user) {
        // 2. If he is there --> generate an accessToken (optionally a refresh token)
        const accessToken = await createAccessToken({ _id: user._id, role: user.role })

        // 2.1 Then we can go next (to /googleRedirect route handler function), passing the token
        passportNext(null, { accessToken })
      } else {
        // 3. If the user is not in our db --> create that
        const newUser = new UsersModel({
          name: given_name,
          surname: family_name,
          email,
          googleId: profile.id,
        })
        const createdUser = await newUser.save()

        // 3.1 Then generate an accessToken (optionally a refresh token)
        const accessToken = await createAccessToken({
          _id: createdUser._id,
          role: createdUser.role,
        })

        // 3.2 Then we can go next (to /googleRedirect route handler function), passing the token
        passportNext(null, { accessToken })
      }
    } catch (error) {
      console.log(error)
      // 4. In case of errors we are going to catch'em
      passportNext(error)
    }
  }
)

export default googleStrategy
