import mongoose from "mongoose";
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    vendor: { type: String },
    plan: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
      required: true,
    },
    nextRenewalDate: { type: Date },
    category: { type: String, index: true },
    notes: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

SubscriptionSchema.virtual("formattedPrice").get(function () {
  return `${this.currency} ${this.amount}`;
});

export default mongoose.model("Subscription", SubscriptionSchema);
