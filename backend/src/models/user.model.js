import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../constants/enums.js";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    first_name: {
      type: String,
      required: false,
    },
    last_name: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
    },
    address: {
      type: String,
    },
    full_name: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    // SMTP Configuration for forgot password emails
    smtpEmail: {
      type: String,
      select: false,
    },
    smtpPassword: {
      type: String,
      select: false,
    },
    smtpHost: {
      type: String,
      default: "smtp.gmail.com",
      select: false,
    },
    smtpPort: {
      type: Number,
      default: 587,
      select: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    if (
      this.password.startsWith("$2a$") ||
      this.password.startsWith("$2b$") ||
      this.password.startsWith("$2y$")
    ) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
