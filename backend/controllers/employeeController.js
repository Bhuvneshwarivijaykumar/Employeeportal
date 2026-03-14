const Employee = require('../models/employeeModel');
const DeleteCount = require('../models/deleteCountModel');
const fs = require('fs');
const path = require('path');


const createEmployee = async (req, res) => {
  try {
    const { name, employeeId, department, salary, email } = req.body;

    if (!name || !employeeId || !department || !salary || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingEmpId = await Employee.findOne({ employeeId, isDeleted: false });
    if (existingEmpId) {
      return res.status(409).json({ message: 'Employee ID already exists' });
    }


    const existingEmail = await Employee.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (existingEmail) {
      return res.status(409).json({ message: 'Employee email already exists' });
    }

    const employeeData = {
      name,
      employeeId,
      department,
      salary: Number(salary),
      email: email.toLowerCase(),
    };

    if (req.file) {
      employeeData.photo = `/uploads/employeePhotos/${req.file.filename}`;
    }

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getEmployees = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'all') {
      query.department = { $regex: department, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      employees,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { name, employeeId, department, salary, email } = req.body;

    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }


    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmpId = await Employee.findOne({
        employeeId,
        isDeleted: false,
        _id: { $ne: req.params.id },
      });
      if (existingEmpId) {
        return res.status(409).json({ message: 'Employee ID already exists' });
      }
    }


    if (email && email.toLowerCase() !== employee.email) {
      const existingEmail = await Employee.findOne({
        email: email.toLowerCase(),
        isDeleted: false,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(409).json({ message: 'Employee email already exists' });
      }
    }

    const updateData = {
      name: name || employee.name,
      employeeId: employeeId || employee.employeeId,
      department: department || employee.department,
      salary: salary ? Number(salary) : employee.salary,
      email: email ? email.toLowerCase() : employee.email,
    };

    if (req.file) {
  
      if (employee.photo) {
        const oldPath = path.join(__dirname, '..', employee.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.photo = `/uploads/employeePhotos/${req.file.filename}`;
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updated,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    
    employee.isDeleted = true;
    employee.deletedAt = new Date();
    await employee.save();

 
    await DeleteCount.create({
      employeeId: employee._id,
      employeeEmpId: employee.employeeId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      department: employee.department,
      salary: employee.salary,
      deletedBy: req.user._id,
      deletedByName: req.user.name,
      deletedAt: new Date(),
      reason: req.body.reason || 'Soft delete via Employee Management System',
    });

    res.status(200).json({
      success: true,
      message: `Employee "${employee.name}" has been deleted`,
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getDeleteHistory = async (req, res) => {
  try {
    const history = await DeleteCount.find().sort({ deletedAt: -1 }).limit(50);
    const totalDeleted = await DeleteCount.countDocuments();

    res.status(200).json({
      success: true,
      totalDeleted,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getStats = async (req, res) => {
  try {
    const totalActive = await Employee.countDocuments({ isDeleted: false });
    const totalDeleted = await DeleteCount.countDocuments();

    const departments = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
      { $sort: { count: -1 } },
    ]);

    const avgSalary = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, avg: { $avg: '$salary' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalActive,
        totalDeleted,
        departments,
        avgSalary: avgSalary[0]?.avg || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getDeleteHistory,
  getStats,
};
