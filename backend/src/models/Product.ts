import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  technologies: string[];
  images: string[];
  demoUrl?: string;
  sourceCodeUrl?: string;
  author: Types.ObjectId;
  averageRating: number;
  numOfReviews: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true, min: 0 },
    category: { type: String, required: true, index: true },
    technologies: { type: [String], default: [] },
    images: { type: [String], default: [] },
    demoUrl: String,
    sourceCodeUrl: { type: String, select: false },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

// Full-text index on title + description for search
ProductSchema.index({ title: "text", description: "text" });
// Compound index to power filter + sort by rating
ProductSchema.index({ category: 1, averageRating: -1 });

// Virtual reverse populate to Reviews collection
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

const Product: Model<IProduct> =
  (mongoose.models["Product"] as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
