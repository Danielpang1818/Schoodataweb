import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// 1. Setup Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// 2. Connect to MongoDB Atlas
if (!process.env.MONGO_URI) {
  console.error("❌ Error: MONGO_URI is missing from your .env file!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Connection error:", err));

// 3. Define Data Models (Schemas)

const teacherSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  department: String,
  room: String
});
const Teacher = mongoose.model('Teacher', teacherSchema);

const studentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  firstName: String,
  lastName: String,
  grade: Number,
  studentNumber: String,
  homeroom: String
});
const Student = mongoose.model('Student', studentSchema);

const courseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  code: String,
  name: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  semester: String,
  room: String,
  schedule: String
});
const Course = mongoose.model('Course', courseSchema);

const testSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  testName: String,
  date: String,
  mark: Number,
  outOf: Number,
  weight: Number
});
const Test = mongoose.model('Test', testSchema);


// Helper function to get the next custom ID (since you use 1, 2, 3...)
async function getNextId(model) {
  const lastItem = await model.findOne().sort({ id: -1 });
  return lastItem && lastItem.id ? lastItem.id + 1 : 1;
}

// 4. Routes (Refactored for MongoDB)

app.get("/", (req, res) => {
  res.send("School API is running with MongoDB");
});

// --- TEACHERS ---
app.get("/teachers", async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

app.get("/teachers/:id", async (req, res) => {
  const teacher = await Teacher.findOne({ id: parseInt(req.params.id) });
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });
  res.json(teacher);
});

app.post("/teachers", async (req, res) => {
  const newId = await getNextId(Teacher);
  const newTeacher = new Teacher({
    id: newId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    department: req.body.department,
    room: req.body.room,
  });
  await newTeacher.save();
  res.status(201).json(newTeacher);
});

app.put("/teachers/:id", async (req, res) => {
  const teacher = await Teacher.findOneAndUpdate(
    { id: parseInt(req.params.id) },
    req.body,
    { new: true } // Return the updated document
  );
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });
  res.json(teacher);
});

app.delete("/teachers/:id", async (req, res) => {
  const result = await Teacher.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!result) return res.status(404).json({ error: "Teacher not found" });
  res.json(result);
});


// --- COURSES ---
app.get("/courses", async (req, res) => {
  // .populate shows the Teacher details instead of just an ID
  const courses = await Course.find().populate('teacherId', 'firstName lastName');
  res.json(courses);
});

app.get("/courses/:id", async (req, res) => {
  const course = await Course.findOne({ id: parseInt(req.params.id) }).populate('teacherId');
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.post("/courses", async (req, res) => {
  // Warning: You usually need to find the Teacher's _id to link them properly
  // For now, we assume req.body.teacherId is the MongoDB _id string. 
  // If your frontend sends "1", you might need to find the teacher first.
  
  const newId = await getNextId(Course);
  const newCourse = new Course({
    id: newId,
    code: req.body.code,
    name: req.body.name,
    teacherId: req.body.teacherId, // Expects MongoDB _id
    semester: req.body.semester,
    room: req.body.room,
    schedule: req.body.schedule,
  });
  await newCourse.save();
  res.status(201).json(newCourse);
});

app.put("/courses/:id", async (req, res) => {
  const course = await Course.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.delete("/courses/:id", async (req, res) => {
  const result = await Course.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!result) return res.status(404).json({ error: "Course not found" });
  res.json(result);
});


// --- STUDENTS ---
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get("/students/:id", async (req, res) => {
  const student = await Student.findOne({ id: parseInt(req.params.id) });
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.post("/students", async (req, res) => {
  const newId = await getNextId(Student);
  const newStudent = new Student({
    id: newId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    grade: req.body.grade,
    studentNumber: req.body.studentNumber,
    homeroom: req.body.homeroom,
  });
  await newStudent.save();
  res.status(201).json(newStudent);
});

app.put("/students/:id", async (req, res) => {
  const student = await Student.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.delete("/students/:id", async (req, res) => {
  const result = await Student.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!result) return res.status(404).json({ error: "Student not found" });
  res.json(result);
});


// --- TESTS ---
app.get("/tests", async (req, res) => {
  const tests = await Test.find();
  res.json(tests);
});

app.get("/tests/:id", async (req, res) => {
  const test = await Test.findOne({ id: parseInt(req.params.id) });
  if (!test) return res.status(404).json({ error: "Test not found" });
  res.json(test);
});

app.post("/tests", async (req, res) => {
  const newId = await getNextId(Test);
  const newTest = new Test({
    id: newId,
    studentId: req.body.studentId, // Expects MongoDB _id
    courseId: req.body.courseId,   // Expects MongoDB _id
    testName: req.body.testName,
    date: req.body.date,
    mark: req.body.mark,
    outOf: req.body.outOf,
    weight: req.body.weight,
  });
  await newTest.save();
  res.status(201).json(newTest);
});

app.put("/tests/:id", async (req, res) => {
  const test = await Test.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
  if (!test) return res.status(404).json({ error: "Test not found" });
  res.json(test);
});

app.delete("/tests/:id", async (req, res) => {
  const result = await Test.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!result) return res.status(404).json({ error: "Test not found" });
  res.json(result);
});


// --- ADVANCED QUERIES ---

// All tests for a student (using custom ID '1' in URL, but searching by MongoDB _id inside tests)
app.get("/students/:id/tests", async (req, res) => {
  const student = await Student.findOne({ id: parseInt(req.params.id) });
  if (!student) return res.status(404).json({ error: "Student not found" });

  const studentTests = await Test.find({ studentId: student._id }).populate('courseId');
  res.json(studentTests);
});

// All tests for a course
app.get("/courses/:id/tests", async (req, res) => {
  const course = await Course.findOne({ id: parseInt(req.params.id) });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const courseTests = await Test.find({ courseId: course._id });
  res.json(courseTests);
});

// Class average for a course
app.get("/courses/:id/average", async (req, res) => {
  const course = await Course.findOne({ id: parseInt(req.params.id) });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const courseTests = await Test.find({ courseId: course._id });

  if (courseTests.length === 0) {
    return res.json({
      courseId: course.id,
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
    courseId: course.id,
    average: Number(average.toFixed(2)),
    testCount: courseTests.length,
  });
});

// Student average
app.get("/students/:id/average", async (req, res) => {
  const student = await Student.findOne({ id: parseInt(req.params.id) });
  if (!student) return res.status(404).json({ error: "Student not found" });

  const studentTests = await Test.find({ studentId: student._id });

  if (studentTests.length === 0) {
    return res.json({
      studentId: student.id,
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
    studentId: student.id,
    testCount: studentTests.length,
    averagePercent: Number(average.toFixed(2)),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});