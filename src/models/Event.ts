import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  committee: mongoose.Types.ObjectId;
  type: "meeting" | "event" | "workshop" | "conference" | "other";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  startDate: Date;
  endDate: Date;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  attendees: {
    user: mongoose.Types.ObjectId;
    status: "invited" | "accepted" | "declined" | "attended";
  }[];
  agenda?: string;
  minutes?: string;
  banner?: string;
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    committee: { type: Schema.Types.ObjectId, ref: "Committee", required: true },
    type: {
      type: String,
      enum: ["meeting", "event", "workshop", "conference", "other"],
      default: "meeting",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    isVirtual: { type: Boolean, default: false },
    meetingLink: { type: String },
    attendees: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["invited", "accepted", "declined", "attended"],
          default: "invited",
        },
      },
    ],
    agenda: { type: String },
    minutes: { type: String },
    banner: { type: String, default: "" },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        size: { type: Number },
        type: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
