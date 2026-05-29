import mongoose from "mongoose";

const auditLogSchema = mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    table_name: {
      type: String,
      required: true,
    },
    record_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    old_values: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    new_values: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
