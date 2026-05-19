import mongoose, { Schema, Document } from "mongoose";

export interface ICommittee extends Document {
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "dissolved";
  chairman: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
  }[];
  establishedDate: Date;
  mandate?: string;
  meetingFrequency?: string;
  avatar?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommitteeSchema = new Schema<ICommittee>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive", "dissolved"], default: "active" },
    chairman: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, default: "Member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    establishedDate: { type: Date, required: true },
    mandate: { type: String },
    meetingFrequency: { type: String, default: "Monthly" },
    avatar: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Committee || mongoose.model<ICommittee>("Committee", CommitteeSchema);
