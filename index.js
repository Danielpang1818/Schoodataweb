import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Paths
const TEACHERS_FILE = path.join(__dirname, "teachers.json");
const COURSES_FILE = path.join(__dirname, "courses.json");
const STUDENTS_FILE = path.join(__dirname, "students.json");
const TESTS_FILE = path.join(__dirname, "tests.json");

console.log("TEACHERS_FILE path:", TEACHERS_FILE, fs.existsSync(TEACHERS_FILE));
console.log("COURSES_FILE path:", COURSES_FILE, fs.existsSync(COURSES_FILE));
console.log("STUDENTS_FILE path:", STUDENTS_FILE, fs.existsSync(STUDENTS_FILE));
console.log("TESTS_FILE path:", TESTS_FILE, fs.existsSync(TESTS_FILE));


function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const data = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Error parsing JSON from", filePath, err);
    return [];
  }
}

function saveJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, "utf-8");
}

let teachers = loadJson(TEACHERS_FILE);
let courses = loadJson(COURSES_FILE);
let students = loadJson(STUDENTS_FILE);
let tests = loadJson(TESTS_FILE);

console.log("Teachers loaded:", teachers);
console.log("Courses loaded:", courses);
console.log("Students loaded:", students);
console.log("Tests loaded:", tests);

function getNextId(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 1;
  }
  const maxId = items.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);
  return maxId + 1;
}

let nextTeacherId = getNextId(teachers);
let nextCourseId = getNextId(courses);
let nextStudentId = getNextId(students);
let nextTestId = getNextId(tests);

app.get("/", (req, res) => {
  res.send("School API is running");
});

// TEACHERS
app.get("/teachers", (req, res) => {
  res.json(teachers);
});

app.get("/teachers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const teacher = teachers.find((t) => t.id === id);

  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  res.json(teacher);
});

app.post("/teachers", (req, res) => {
  const newTeacher = {
    id: nextTeacherId++,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    department: req.body.department,
    room: req.body.room,
  };

  teachers.push(newTeacher);
  saveJson(TEACHERS_FILE, teachers);

  res.status(201).json(newTeacher);
});

app.put("/teachers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const teacher = teachers.find((t) => t.id === id);

  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  teacher.firstName = req.body.firstName ?? teacher.firstName;
  teacher.lastName = req.body.lastName ?? teacher.lastName;
  teacher.email = req.body.email ?? teacher.email;
  teacher.department = req.body.department ?? teacher.department;
  teacher.room = req.body.room ?? teacher.room;

  saveJson(TEACHERS_FILE, teachers);

  res.json(teacher);
});

app.delete("/teachers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = teachers.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  const deleted = teachers.splice(index, 1)[0];
  saveJson(TEACHERS_FILE, teachers);

  res.json(deleted);
});

// COURSES
app.get("/courses", (req, res) => {
  res.json(courses);
});

app.get("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  res.json(course);
});

app.post("/courses", (req, res) => {
  const newCourse = {
    id: nextCourseId++,
    code: req.body.code,
    name: req.body.name,
    teacherId: req.body.teacherId,
    semester: req.body.semester,
    room: req.body.room,
    schedule: req.body.schedule,
  };

  courses.push(newCourse);
  saveJson(COURSES_FILE, courses);

  res.status(201).json(newCourse);
});

app.put("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  course.code = req.body.code ?? course.code;
  course.name = req.body.name ?? course.name;
  course.teacherId = req.body.teacherId ?? course.teacherId;
  course.semester = req.body.semester ?? course.semester;
  course.room = req.body.room ?? course.room;
  course.schedule = req.body.schedule ?? course.schedule;

  saveJson(COURSES_FILE, courses);

  res.json(course);
});

app.delete("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = courses.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Course not found" });
  }

  const deleted = courses.splice(index, 1)[0];
  saveJson(COURSES_FILE, courses);

  res.json(deleted);
});

// STUDENTS
app.get("/students", (req, res) => {
  res.json(students);
});

app.get("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

app.post("/students", (req, res) => {
  const newStudent = {
    id: nextStudentId++,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    grade: req.body.grade,
    studentNumber: req.body.studentNumber,
    homeroom: req.body.homeroom,
  };

  students.push(newStudent);
  saveJson(STUDENTS_FILE, students);

  res.status(201).json(newStudent);
});

app.put("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  student.firstName = req.body.firstName ?? student.firstName;
  student.lastName = req.body.lastName ?? student.lastName;
  student.grade = req.body.grade ?? student.grade;
  student.studentNumber = req.body.studentNumber ?? student.studentNumber;
  student.homeroom = req.body.homeroom ?? student.homeroom;

  saveJson(STUDENTS_FILE, students);

  res.json(student);
});

app.delete("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const deleted = students.splice(index, 1)[0];
  saveJson(STUDENTS_FILE, students);

  res.json(deleted);
});

// TESTS
app.get("/tests", (req, res) => {
  res.json(tests);
});

app.get("/tests/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const test = tests.find((t) => t.id === id);

  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  res.json(test);
});

app.post("/tests", (req, res) => {
  const newTest = {
    id: nextTestId++,
    studentId: req.body.studentId,
    courseId: req.body.courseId,
    testName: req.body.testName,
    date: req.body.date,
    mark: req.body.mark,
    outOf: req.body.outOf,
    weight: req.body.weight,
  };

  tests.push(newTest);
  saveJson(TESTS_FILE, tests);

  res.status(201).json(newTest);
});

app.put("/tests/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const test = tests.find((t) => t.id === id);

  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  test.studentId = req.body.studentId ?? test.studentId;
  test.courseId = req.body.courseId ?? test.courseId;
  test.testName = req.body.testName ?? test.testName;
  test.date = req.body.date ?? test.date;
  test.mark = req.body.mark ?? test.mark;
  test.outOf = req.body.outOf ?? test.outOf;
  test.weight = req.body.weight ?? test.weight;

  saveJson(TESTS_FILE, tests);

  res.json(test);
});

app.delete("/tests/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tests.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Test not found" });
  }

  const deleted = tests.splice(index, 1)[0];
  saveJson(TESTS_FILE, tests);

  res.json(deleted);
});

//Tests for a student
app.get("/students/:id/tests", (req, res) => {
  const id = parseInt(req.params.id);

  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const studentTests = tests.filter((t) => t.studentId === id);
  res.json(studentTests);
});

//all tests for a course
app.get("/courses/:id/tests", (req, res) => {
  const id = parseInt(req.params.id);

  const course = courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const courseTests = tests.filter((t) => t.courseId === id);
  res.json(courseTests);
});

//student average
// Get a student's average across all their tests
app.get("/students/:id/average", (req, res) => {
  const id = parseInt(req.params.id);

  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const studentTests = tests.filter((t) => t.studentId === id);

  if (studentTests.length === 0) {
    return res.json({
      studentId: id,
      average: null,
      testCount: 0,
      message: "This student has no tests yet.",
    });
  }

  const totalPercent = studentTests.reduce((sum, test) => {
    const percent = (test.mark / test.outOf) * 100;
    return sum + percent;
  }, 0);

  const average = totalPercent / studentTests.length;

  res.json({
    studentId: id,
    average: Number(average.toFixed(2)),
    testCount: studentTests.length,
  });
});

//class average for a course
app.get("/courses/:id/average", (req, res) => {
  const id = parseInt(req.params.id);

  const course = courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const courseTests = tests.filter((t) => t.courseId === id);

  if (courseTests.length === 0) {
    return res.json({
      courseId: id,
      average: null,
      testCount: 0,
      message: "This course has no tests yet.",
    });
  }

  const totalPercent = courseTests.reduce((sum, test) => {
    const percent = (test.mark / test.outOf) * 100;
    return sum + percent;
  }, 0);

  const average = totalPercent / courseTests.length;

  res.json({
    courseId: id,
    average: Number(average.toFixed(2)),
    testCount: courseTests.length,
  });
});


app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
