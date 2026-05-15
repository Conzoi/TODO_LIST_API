const request = require("supertest");
const app = require("../server");

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toISOString();
}

beforeEach(async () => {
  await request(app).delete("/test/reset");
});

test("Tạo task thành công", async () => {
  const res = await request(app).post("/tasks").send({
    title: "Học Express",
    description: "Làm bài API phần 2",
    deadline: futureDate(),
  });

  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe("Học Express");
  expect(res.body.status).toBe("doing");
});

test("Không cho tạo task nếu title rỗng", async () => {
  const res = await request(app).post("/tasks").send({
    title: "",
    deadline: futureDate(),
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBe("Tiêu đề không được rỗng");
});

test("Không cho tạo task nếu deadline là ngày quá khứ", async () => {
  const res = await request(app).post("/tasks").send({
    title: "Task lỗi",
    deadline: "2020-01-01",
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBe("Deadline phải là ngày trong tương lai");
});

test("Lọc task theo trạng thái done", async () => {
  const createRes = await request(app).post("/tasks").send({
    title: "Task cần hoàn thành",
    deadline: futureDate(),
  });

  await request(app).patch(`/tasks/${createRes.body.id}/done`);

  const res = await request(app).get("/tasks?status=done");

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].status).toBe("done");
});

test("Trả lỗi khi không tìm thấy task", async () => {
  const res = await request(app).get("/tasks/999");

  expect(res.statusCode).toBe(404);
  expect(res.body.error).toBe("Không tìm thấy task");
});