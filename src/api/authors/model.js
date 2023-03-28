import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const authorsSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    DOB: { type: String },
    avatar: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Author", "Admin"], default: "Author" },
    friends: {
      default: [],
      type: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    },
    pendingFriends: { default: [], type: [{ type: Schema.Types.ObjectId, ref: "Author" }] },
    status: String,
  },

  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
)

const friendsSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: "Users" },
    recipient: { type: Schema.Types.ObjectId, ref: "Users" },
    status: {
      type: Number,
      enums: [
        0, //'add friend',
        1, //'requested',
        2, //'pending',
        3, //'friends'
      ],
    },
  },

  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
)

authorsSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, executes this custom function automagically
  // Here I am not using arrow functions as I normally do because of "this" keyword
  // (it would be undefined in case of arrow function, it is the current user in the case of a normal function)

  const currentAuthor = this

  if (currentAuthor.isModified("password")) {
    // only if the user is modifying the pw (or if the user is being created) I would like to spend some precious CPU cycles on hashing the pw
    const plainPW = currentAuthor.password

    const hash = await bcrypt.hash(plainPW, 11)
    currentAuthor.password = hash
  }
  // When we are done with this function --> next
  next()
})

authorsSchema.methods.toJSON = function () {
  // This .toJSON method is used EVERY TIME Express does a res.send(user/s)
  // This does mean that we could override the default behaviour of this method to remove the passwords (and other unnecessary things as well) and then return the users

  const authorDocument = this
  const author = authorDocument.toObject()

  // delete author.password
  delete author.createdAt
  delete author.updatedAt
  delete author.__v
  return author
}

authorsSchema.static("checkCredentials", async function (email, password) {
  // My own custom method attached to the UsersModel

  // Given email and plain text password, this method has to check in the db if the user exists (by email)
  // Then it should compare the given password with the hashed one coming from the db
  // Then it should return an useful response

  // 1. Find by email
  const author = await this.findOne({ email }) //"this" here represents the User Model

  if (author) {
    // 2. If the user is found --> compare plain password with the hashed one
    const passwordMatch = await bcrypt.compare(password, author.password)

    if (passwordMatch) {
      // 3. If passwords they match --> return user

      return author
    } else {
      // 4. If they don't --> return null
      return null
    }
  } else {
    // 5. In case of user not found --> return null
    return null
  }
})

let AuthorModel = model("Author", authorsSchema)
let FriendsModel = model("Friend", friendsSchema)

export { AuthorModel, FriendsModel }
