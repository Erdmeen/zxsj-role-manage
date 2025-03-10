const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

// 获取用户数据
router.get('/sync', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 确保返回有效的 JSON 数据
    const userData = user.data || { roles: [] };
    console.log('获取数据:', userData); // 添加日志
    res.json(userData);
  } catch (error) {
    console.error('获取数据错误:', error);
    res.status(500).json({ message: '获取数据失败' });
  }
});

// 同步用户数据
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    console.log('收到同步请求，请求体:', req.body); // 添加日志

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取当前数据
    const currentData = user.data || { roles: [] };
    console.log('当前数据:', currentData); // 添加日志

    // 获取请求体中的数据
    const { roles } = req.body;

    // 合并数据，保留现有数据的其他字段
    const updatedData = {
      ...currentData, // 保留现有数据
      roles: Array.isArray(roles) ? roles : (currentData.roles || [])
    };

    console.log('更新后的数据:', updatedData); // 添加日志

    // 更新用户数据
    await user.update({ data: updatedData });

    // 重新获取用户数据以确保返回最新状态
    const updatedUser = await User.findByPk(req.user.userId);
    const finalData = updatedUser.data || { roles: [] };
    
    console.log('最终数据:', finalData); // 添加日志
    
    res.json({ 
      message: '数据同步成功', 
      data: finalData
    });
  } catch (error) {
    console.error('同步数据错误:', error);
    res.status(500).json({ message: '同步数据失败', error: error.message });
  }
});

module.exports = router; 