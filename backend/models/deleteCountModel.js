const mongoose = require('mongoose');

const deleteCountSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    employeeEmpId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedByName: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      default: 'Soft delete via Employee Management System',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeleteCount', deleteCountSchema);
