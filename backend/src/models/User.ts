import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";

/**
 * User document interface. `password` is `select: false`, so it will be
 * undefined unless explicitly selected in a query.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  password?: string;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  purchasedItems: Types.ObjectId[];
  createdAt: Date;

  matchPassword(entered: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
  getEmailVerificationToken(): string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: [true, "Please add a name"], trim: true },
  avatar: { type: String, default: "" },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    index: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  purchasedItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
});

// Encrypt password using bcrypt before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const expiresIn = (process.env["JWT_EXPIRE"] || "30d") as SignOptions["expiresIn"];
  return jwt.sign({ id: this._id.toString() }, secret, { expiresIn });
};

// Match user-entered password to hashed password in DB
UserSchema.methods.matchPassword = async function (
  entered: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

// Generate and hash reset password token
UserSchema.methods.getResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Token valid for 10 minutes
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// Generate and hash email verification token
UserSchema.methods.getEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(20).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

const User: Model<IUser> =
  (mongoose.models["User"] as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
