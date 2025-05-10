const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  date: { type: String, required: [true, "A report must have a date"] },
  timeIn: { type: String },
  timeOut: { type: String },
  statusIn: { type: String, default: "Not Checked" },
  statusOut: { type: String, default: "Not Checked" },
  notes: { type: String },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: "Employee",
    required: [true, "A report must belong to a employee"]
  }
});

reportSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: "employee",
  //   select: ["-__v", "-account", "-report"] // Exclude unnecessary fields
  // });
  next();
});
const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
