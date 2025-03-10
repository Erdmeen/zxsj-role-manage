const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { roles: [] },
    get() {
      const rawValue = this.getDataValue('data');
      if (!rawValue) return { roles: [] };
      
      try {
        // 如果已经是对象，直接返回
        if (typeof rawValue === 'object' && rawValue !== null) {
          return rawValue;
        }
        // 如果是字符串，尝试解析
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('解析 data 字段失败:', error);
        return { roles: [] };
      }
    },
    set(value) {
      try {
        // 如果是字符串，尝试解析
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        // 确保值是一个对象
        if (typeof value !== 'object' || value === null) {
          value = { roles: [] };
        }
        this.setDataValue('data', value);
      } catch (error) {
        console.error('设置 data 字段失败:', error);
        this.setDataValue('data', { roles: [] });
      }
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User; 