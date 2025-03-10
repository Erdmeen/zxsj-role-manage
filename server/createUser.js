require('dotenv').config();
const { User } = require('./models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise 包装的问题函数
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
  try {
    let userCreated = false;
    
    while (!userCreated) {
      // 获取用户输入
      const username = (await question('请输入用户名: ')).trim();
      
      // 检查用户名是否为空
      if (!username) {
        console.log('用户名不能为空，请重试');
        continue;
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        console.log('用户名已存在，请使用其他用户名');
        const retry = (await question('是否重试? (y/n): ')).toLowerCase();
        if (retry !== 'y') {
          console.log('用户创建已取消');
          process.exit(0);
        }
        continue;
      }

      const password = (await question('请输入密码: ')).trim();
      
      // 检查密码是否为空
      if (!password) {
        console.log('密码不能为空，请重试');
        continue;
      }

      // 确认密码
      const confirmPassword = (await question('请再次输入密码: ')).trim();
      if (password !== confirmPassword) {
        console.log('两次输入的密码不匹配，请重试');
        continue;
      }

      try {
        // 创建新用户
        const user = await User.create({
          username,
          password,
          data: { roles: [] }
        });

        console.log('\n用户创建成功！');
        console.log('------------------------');
        console.log('用户ID:', user.id);
        console.log('用户名:', user.username);
        console.log('------------------------\n');
        userCreated = true;
      } catch (error) {
        console.error('创建用户失败:', error.message);
        const retry = (await question('是否重试? (y/n): ')).toLowerCase();
        if (retry !== 'y') {
          console.log('用户创建已取消');
          break;
        }
      }
    }
  } finally {
    rl.close();
  }
}

// 运行脚本
createUser(); 