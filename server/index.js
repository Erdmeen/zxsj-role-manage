require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./models/database');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误', error: err.message });
});

// 同步数据库并启动服务器
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('数据库同步失败:', err);
}); 