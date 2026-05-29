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
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
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
  },
  { timestamps: true, versionKey: false },
);

// Pre-save middleware: Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Check if password is already hashed (starts with $2a, $2b, or $2y for bcrypt)
    if (
      this.password.startsWith("$2a$") ||
      this.password.startsWith("$2b$") ||
      this.password.startsWith("$2y$")
    ) {
      return next();
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to exclude sensitive fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
