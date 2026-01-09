import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './db.js';

// 1. Setup Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB(); 

app.use(express.json());
app.use(cors());

const teacherSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  department: String,
  room: String
});
const Teacher = mongoose.model('Teacher', teacherSchema);

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  grade: Number,
  studentNumber: String,
  homeroom: String
});
const Student = mongoose.model('Student', studentSchema);

const courseSchema = new mongoose.Schema({
  code: String,
  name: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  semester: String,
  room: String,
  schedule: String
});
const Course = mongoose.model('Course', courseSchema);

const testSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  testName: String,
  date: String,
  mark: Number,
  outOf: Number,
  weight: Number
});
const Test = mongoose.model('Test', testSchema);

// 4. Routes (Refactored for MongoDB _id)

app.get("/", (req, res) => {
  res.send("School API is running with MongoDB Native IDs");
});

// --- TEACHERS ---
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.post("/teachers", async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/teachers/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const result = await Teacher.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Teacher not found" });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});


// --- COURSES ---
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate('teacherId', 'firstName lastName');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacherId');
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.post("/courses", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.delete("/courses/:id", async (req, res) => {
  try {
    const result = await Course.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});


// --- STUDENTS ---
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});


// --- TESTS ---
app.get("/tests", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tests/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.post("/tests", async (req, res) => {
  try {
    const newTest = new Test(req.body);
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/tests/:id", async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.delete("/tests/:id", async (req, res) => {
  try {
    const result = await Test.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Test not found" });
    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});


// --- ADVANCED QUERIES ---

// All tests for a student
app.get("/students/:id/tests", async (req, res) => {
  try {
    // 1. Find student by Mongo ID
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // 2. Find tests linked to that Mongo ID
    const studentTests = await Test.find({ studentId: student._id }).populate('courseId');
    res.json(studentTests);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

// All tests for a course
app.get("/courses/:id/tests", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const courseTests = await Test.find({ courseId: course._id });
    res.json(courseTests);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

// Class average for a course
app.get("/courses/:id/average", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const courseTests = await Test.find({ courseId: course._id });

    if (courseTests.length === 0) {
      return res.json({
        courseId: course._id,
        average: null,
        testCount: 0,
        message: "This course has no tests yet.",
      });
    }

    const totalPercent = courseTests.reduce((sum, test) => {
      return sum + ((test.mark / test.outOf) * 100);
    }, 0);

    const average = totalPercent / courseTests.length;

    res.json({
      courseId: course._id,
      average: Number(average.toFixed(2)),
      testCount: courseTests.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

// Student average
app.get("/students/:id/average", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const studentTests = await Test.find({ studentId: student._id });

    if (studentTests.length === 0) {
      return res.json({
        studentId: student._id,
        testCount: 0,
        averagePercent: 0,
        message: "No tests found"
      });
    }

    const totalPercent = studentTests.reduce((sum, test) => {
      return sum + ((test.mark / test.outOf) * 100);
    }, 0);

    const average = totalPercent / studentTests.length;

    res.json({
      studentId: student._id,
      testCount: studentTests.length,
      averagePercent: Number(average.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});