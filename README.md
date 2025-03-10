# 诛仙世界角色周任务记录系统

这是一个基于 Vue.js 开发的诛仙世界角色周任务记录系统，用于帮助玩家管理和追踪多个角色的周常任务完成情况。

## 功能特点

- 🎮 多角色管理：支持添加、编辑和删除多个游戏角色
- 📝 任务追踪：包含预设的副本、帮派、世界等多种类型任务
- ⚔️ 副本分类：支持 5人、10人、20人副本，困难和噩梦难度
- 💰 银两统计：记录每个角色的银两数量，自动计算总资产
- 🔄 周常重置：每周三早上8点自动重置任务状态
- 📊 进度显示：直观展示每个角色的任务完成进度
- 💾 数据同步：支持数据导入导出，方便备份和迁移
- 🔐 账号系统：支持用户登录，数据云端同步（开发中）

## 使用说明

1. 角色管理
   - 点击"添加角色"创建新角色
   - 设置角色名称、职业等信息
   - 可随时编辑或删除已有角色

2. 任务管理
   - 支持预设任务和自定义任务
   - 按类别（副本、帮派、世界等）组织任务
   - 可一键全选某类别的任务
   - 支持任务状态切换和进度追踪

3. 数据管理
   - 数据自动保存在浏览器本地存储
   - 支持导出数据备份
   - 支持导入已备份的数据

## 技术栈

- Vue.js 3
- 原生 CSS
- 本地存储 (LocalStorage)

## 注意事项

- 浏览器清除缓存会导致本地数据丢失，请定期导出备份
- 建议使用现代浏览器（Chrome、Firefox、Safari等）访问
- 每周三早上8点系统自动重置所有任务状态

## 未来计划

- [ ] 完善账号系统
- [ ] 添加数据云端备份
- [ ] 优化移动端适配
- [ ] 增加更多自定义选项
- [ ] 支持任务优先级设置
- [ ] 添加任务完成时间统计 


## 新建用户
npm run create-user