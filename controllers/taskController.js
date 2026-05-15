const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const { status, deadline, sort } = req.query;

    const filter = {};

    if (status) {
      if (!["dang_lam", "xong"].includes(status)) {
        return res.status(400).json({
          message: "Trạng thái không hợp lệ. Chỉ nhận: dang_lam hoặc xong"
        });
      }
      filter.status = status;
    }

    if (deadline) {
      const date = new Date(deadline);

      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "Deadline không hợp lệ"
        });
      }

      filter.deadline = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    let sortOption = {};

    if (sort === "deadline") {
      sortOption.deadline = 1;
    } else if (sort === "createdAt") {
      sortOption.createdAt = -1;
    }

    const tasks = await Task.find(filter).sort(sortOption);

    res.json({
      message: "Lấy danh sách task thành công",
      total: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Tiêu đề không được để trống"
      });
    }

    if (!deadline || new Date(deadline) <= new Date()) {
      return res.status(400).json({
        message: "Deadline phải là ngày trong tương lai"
      });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      status
    });

    res.status(201).json({
      message: "Tạo task thành công",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      message: "Input không hợp lệ",
      error: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, deadline } = req.body;

    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        message: "Tiêu đề không được để trống"
      });
    }

    if (deadline !== undefined && new Date(deadline) <= new Date()) {
      return res.status(400).json({
        message: "Deadline phải là ngày trong tương lai"
      });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({
        message: "Không tìm thấy task"
      });
    }

    res.json({
      message: "Cập nhật task thành công",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      message: "Cập nhật thất bại",
      error: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Không tìm thấy task"
      });
    }

    res.json({
      message: "Xóa task thành công"
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

exports.markDone = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "xong" },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Không tìm thấy task"
      });
    }

    res.json({
      message: "Đã đánh dấu task hoàn thành",
      data: task
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};