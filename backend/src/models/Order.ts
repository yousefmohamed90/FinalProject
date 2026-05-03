import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
  product: Types.ObjectId;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  sessionId: string;
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderItems: { type: [OrderItemSchema], required: true },
    sessionId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const Order: Model<IOrder> =
  (mongoose.models["Order"] as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
