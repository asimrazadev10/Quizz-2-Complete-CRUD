import mongoose from "mongoose";
const { Schema } = mongoose;

// Sub-schema for cleaner structure
const ContactInfoSchema = new Schema(
  {
    name: String,
    email: { type: String, lowercase: true, trim: true },
    phone: String,
  },
  { _id: false }
);

const ClientSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: { type: String, required: true },
    contact: ContactInfoSchema, // Embedded sub-document
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Client", ClientSchema);
