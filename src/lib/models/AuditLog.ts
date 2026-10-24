import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  engagementId?: string;
  briefId?: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true, unique: true, index: true },
  engagementId: { type: String, index: true },
  briefId: { type: String, index: true },
  action: { type: String, required: true, index: true },
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  details: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
