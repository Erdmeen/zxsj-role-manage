const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 仅在开发环境下可用的注册接口
if (process.env.NODE_ENV === 'development') {
  router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 创建新用户
      const user = await User.create({ username, password });

      // 生成 JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1m' });

      res.status(201).json({ token, userId: user.id });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error: error.message });
    }
  });
}

module.exports = router; 