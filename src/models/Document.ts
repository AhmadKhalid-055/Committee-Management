import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  name: string;
  url: string; // File URL or base64 representation
  size: number; // File size in bytes
  type: string; // MIME type (e.g., application/pdf)
  category: "minutes" | "report" | "proposal" | "guideline" | "other";
  committee: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    category: {
      type: String,
      enum: ["minutes", "report", "proposal", "guideline", "other"],
      default: "other",
    },
    committee: { type: Schema.Types.ObjectId, ref: "Committee", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
