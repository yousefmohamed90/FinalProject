import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  rating: number;
  comment: string;
  product: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
  getAverageRating(productId: Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Prevent a user from reviewing the same product twice
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Aggregation pipeline to compute and persist average rating on Product
ReviewSchema.statics["getAverageRating"] = async function (
  this: IReviewModel,
  productId: Types.ObjectId,
): Promise<void> {
  const obj = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      averageRating: obj[0]
        ? Math.round((obj[0]["averageRating"] as number) * 10) / 10
        : 0,
      numOfReviews: obj[0] ? (obj[0]["numOfReviews"] as number) : 0,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

// Recalculate average after each save
ReviewSchema.post("save", async function () {
  await (this.constructor as IReviewModel).getAverageRating(this.product);
});

// Recalculate average after a delete via findByIdAndDelete/findOneAndDelete.
ReviewSchema.post("findOneAndDelete", async function (doc: IReview | null) {
  if (doc) {
    await (doc.constructor as IReviewModel).getAverageRating(doc.product);
  }
});

const Review: IReviewModel =
  (mongoose.models["Review"] as IReviewModel) ||
  mongoose.model<IReview, IReviewModel>("Review", ReviewSchema);

export default Review;
