const express = require("express");

const app = express();
app.use(express.json());

let tasks = [];
let nextId = 1;

function isFutureDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return !isNaN(date.getTime()) && date > now;
}

function validateTaskInput(req, res, next) {
  const { title, deadline } = req.body;
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      error: "Name và password không được rỗng",
    });
  }

  if (name === "hieu" && password === "123456") {
    return res.json({
      message: "Đăng nhập thành công",
      user: { name },
    });
  }

  res.status(401).json({
    error: "Sai tài khoản hoặc mật khẩu",
  });
});
  if (!title || title.trim() === "") {
    return res.status(400).json({
      error: "Tiêu đề không được rỗng",
    });
  }

  if (!deadline || !isFutureDate(deadline)) {
    return res.status(400).json({
      error: "Deadline phải là ngày trong tương lai",
    });
  }

  next();
}

// GET danh sách task + filter + sort
app.get("/tasks", (req, res) => {
  let result = [...tasks];

  const { status, deadline, sort } = req.query;

  // Lọc theo trạng thái
  if (status) {
    result = result.filter((task) => task.status === status);
  }

  // Lọc theo deadline: YYYY-MM-DD
  if (deadline) {
    result = result.filter((task) =>
      task.deadline.startsWith(deadline)
    );
  }

  // Sắp xếp theo deadline gần nhất
  if (sort === "deadline") {
    result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  // Sắp xếp theo ngày tạo
  if (sort === "createdAt") {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  res.json(result);
});

// GET task theo id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Không tìm thấy task",
    });
  }

  res.json(task);
});

// POST tạo task
app.post("/tasks", validateTaskInput, (req, res) => {
  const { title, description, deadline } = req.body;

  const task = {
    id: nextId++,
    title,
    description: description || "",
    deadline,
    status: "doing",
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PUT sửa task
app.put("/tasks/:id", validateTaskInput, (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Không tìm thấy task",
    });
  }

  task.title = req.body.title;
  task.description = req.body.description || "";
  task.deadline = req.body.deadline;

  res.json(task);
});

// PATCH đánh dấu done
app.patch("/tasks/:id/done", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Không tìm thấy task",
    });
  }

  task.status = "done";
  res.json(task);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: "Không tìm thấy task",
    });
  }

  tasks.splice(index, 1);
  res.json({
    message: "Xóa task thành công",
  });
});

// Dùng cho test
app.delete("/test/reset", (req, res) => {
  tasks = [];
  nextId = 1;
  res.json({ message: "Reset thành công" });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server đang chạy tại http://localhost:3000");
  });
}

module.exports = app;
