const cloudinary = require("cloudinary");
const Employee = require("../Models/employeeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeature");
const Account = require("../Models/accountModel");

exports.getEmployeeCountsByShift = catchAsync(async (req, res, next) => {
  const counts = await Employee.aggregate([
    {
      $group: {
        _id: "$shift", // Group by the shift field
        numEmployees: { $sum: 1 } // Count the number of employees in each shift
      }
    },
    {
      $lookup: {
        from: "shifts", // The name of the Shift collection in MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "shiftDetails"
      }
    },
    {
      $unwind: "$shiftDetails" // Unwind the shift details array
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the result
        shiftId: "$shiftDetails._id",
        shiftStartTime: "$shiftDetails.startTime",
        shiftEndTime: "$shiftDetails.endTime",
        shiftStartTime12h: {
          $cond: {
            if: "$shiftDetails.startTime",
            then: {
              $let: {
                vars: {
                  timeParts: { $split: ["$shiftDetails.startTime", ":"] }
                },
                in: {
                  $let: {
                    vars: {
                      hours: { $toInt: { $arrayElemAt: ["$$timeParts", 0] } },
                      minutes: { $toInt: { $arrayElemAt: ["$$timeParts", 1] } }
                    },
                    in: {
                      $concat: [
                        {
                          $toString: {
                            $cond: [
                              { $eq: ["$$hours", 0] },
                              12,
                              { $mod: ["$$hours", 12] }
                            ]
                          }
                        },
                        ":",
                        {
                          $toString: {
                            $cond: [
                              { $lt: ["$$minutes", 10] },
                              { $concat: ["0", { $toString: "$$minutes" }] },
                              "$$minutes"
                            ]
                          }
                        },
                        " ",
                        { $cond: [{ $gte: ["$$hours", 12] }, "PM", "AM"] }
                      ]
                    }
                  }
                }
              }
            },
            else: "N/A"
          }
        },
        shiftEndTime12h: {
          $cond: {
            if: "$shiftDetails.endTime",
            then: {
              $let: {
                vars: {
                  timeParts: { $split: ["$shiftDetails.endTime", ":"] }
                },
                in: {
                  $let: {
                    vars: {
                      hours: { $toInt: { $arrayElemAt: ["$$timeParts", 0] } },
                      minutes: { $toInt: { $arrayElemAt: ["$$timeParts", 1] } }
                    },
                    in: {
                      $concat: [
                        {
                          $toString: {
                            $cond: [
                              { $eq: ["$$hours", 0] },
                              12,
                              { $mod: ["$$hours", 12] }
                            ]
                          }
                        },
                        ":",
                        {
                          $toString: {
                            $cond: [
                              { $lt: ["$$minutes", 10] },
                              { $concat: ["0", { $toString: "$$minutes" }] },
                              "$$minutes"
                            ]
                          }
                        },
                        " ",
                        { $cond: [{ $gte: ["$$hours", 12] }, "PM", "AM"] }
                      ]
                    }
                  }
                }
              }
            },
            else: "N/A"
          }
        },
        numEmployees: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    results: counts.length,
    data: {
      counts
    }
  });
});
exports.getEmployeeCountsByDepartment = catchAsync(async (req, res, next) => {
  const counts = await Employee.aggregate([
    {
      $group: {
        _id: "$department", // Group by the department field
        numEmployees: { $sum: 1 } // Count the number of employees in each department
      }
    },
    {
      $lookup: {
        from: "departments", // The name of the Department collection in MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "departmentDetails"
      }
    },
    {
      $unwind: "$departmentDetails" // Unwind the department details array
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the result
        departmentId: "$departmentDetails._id",
        departmentName: "$departmentDetails.name",
        departmentDepId: "$departmentDetails.depId",
        numEmployees: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    results: counts.length,
    data: {
      counts
    }
  });
});
exports.getAllEmployees = catchAsync(async (req, res, next) => {
  // let filter = {};
  // console.log("req.params.id", req.query);
  // ! EXECUTE QUERY
  // let filter = {};
  // if (req.params.id) filter = { employees: req.params.id };

  const features = new APIFeatures(Employee.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const employees = await features.query.populate("reports");

  // const employees = await Employee.find();
  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees
    }
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate("reports");
  if (!employee) return next(new AppError("Employee not found", 404));
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  res.status(200).json({
    status: "success",
    data: {
      employee
    }
  });
});
exports.createEmployee = catchAsync(async (req, res, next) => {
  const { image } = req.files;
  const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedFormats.includes(image.mimetype)) {
    return next(new AppError("Invalid image format", 400));
  }
  const result = await cloudinary.uploader.upload(image.tempFilePath);
  if (!result) {
    return next(new AppError("Image upload failed", 500));
  }
  req.body.image = result.secure_url;
  const employee = await Employee.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      employee
    }
  });
});
exports.updateEmployee = catchAsync(async (req, res, next) => {
  // const { image } = req.files;
  // const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
  // if (!allowedFormats.includes(image.mimetype)) {
  //   return next(new AppError("Invalid image format", 400));
  // }
  // const result = await cloudinary.uploader.upload(image.tempFilePath);
  // if (!result) {
  //   return next(new AppError("Image upload failed", 500));
  // }
  // req.body.image = result.secure_url;
  if (req.files && req.files.image) {
    // console.log("req.files");
    const { image } = req.files;
    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(image.mimetype)) {
      return next(new AppError("Invalid image format", 400));
    }

    const result = await cloudinary.uploader.upload(image.tempFilePath);
    if (!result) {
      return next(new AppError("Image upload failed", 500));
    }

    req.body.image = result.secure_url;
  }

  const updateEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  if (!updateEmployee) return next(new AppError("Employee not found", 404));
  res.status(200).json({
    status: "success",
    data: {
      employee: updateEmployee
    }
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  await Employee.findByIdAndDelete(req.params.id);
  await Account.findOneAndDelete({ employee: req.params.id });
  res.status(204).json({
    status: "success",
    data: null
  });
});
