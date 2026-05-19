import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  recipient: mongoose.Types.ObjectId;
  relatedTo?: {
    model: "Committee" | "Event" | "User";
    id: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedTo: {
      model: { type: String, enum: ["Committee", "Event", "User"] },
      id: { type: Schema.Types.ObjectId },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
