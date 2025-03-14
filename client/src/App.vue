<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import LoginModal from './components/LoginModal.vue';
import Header from './components/Header.vue';
import RoleForm from './components/RoleForm.vue';
import RoleList from './components/RoleList.vue';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import { message } from 'ant-design-vue';

interface Task {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  originalTask?: any;
  isEditing?: boolean;
  editName?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  profession: string;
  silver: number;
  tasks: Task[];
}

interface PredefinedTask {
  name: string;
  size?: number;
  difficulty?: 'hard' | 'nightmare';
  selected?: boolean;
  category?: string;
  displayName?: string;
}

interface PredefinedTasks {
  [key: string]: PredefinedTask[];
}

interface EditingRole {
  name: string;
  description: string;
  profession: string;
  silver: number;
}

// 添加在 setup 函数开始处
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null;
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 添加登录相关的状态
const isLoggedIn = ref(false);
const token = ref('');
const showLoginModal = ref(false);
const loginForm = ref({
  username: '',
  password: ''
});

// 处理登录
const handleLogin = async (username: string, password: string) => {
  if (!username || !password) {
    message.warning('请输入用户名和密码');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.error(data.message || '登录失败，请重试');
      return;
    }

    token.value = data.token;
    isLoggedIn.value = true;
    localStorage.setItem('token', data.token);
    showLoginModal.value = false;
    loginForm.value = { username: '', password: '' };

    // 登录成功后立即从服务器获取数据
    await loadData(false);
    // 登录成功后立即同步当前数据到服务器（不使用防抖）
    if (roles.value.length > 0) {
      await fetch('/api/data/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          roles: roles.value
        })
      });
    }
    message.success('登录成功！');
  } catch (error) {
    console.error('登录错误:', error);
    message.error('登录失败，请检查网络连接');
  }
};

// 登出方法
const logout = () => {
  token.value = '';
  isLoggedIn.value = false;
  localStorage.removeItem('token');
  // 登出后加载本地数据
  loadData();
};

// 检查登录状态
const checkLoginStatus = () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    token.value = savedToken;
    isLoggedIn.value = true;
  }
};

// 在组件挂载时检查登录状态
onMounted(async () => {
  await checkLoginStatus();
  await loadData();
  checkResetDay();
  // 每小时检查一次是否需要重置
  setInterval(checkResetDay, 60 * 60 * 1000);
});

// 数据
const roles = ref<Role[]>([]);
const currentRoleIndex = ref(-1);
const showAddRoleForm = ref(false);
const showAddTaskForm = ref(false);
const showEditRoleForm = ref(false);
const isEditingTask = ref(false);
const editingTaskIndex = ref(-1);
const newRole = ref<Role>({
  id: 0,
  name: "",
  description: "",
  profession: "",
  silver: 0,
  tasks: []
});
const editingRole = ref<EditingRole>({
  name: "",
  description: "",
  profession: "",
  silver: 0,
});
const newTask = ref({ name: "" });
const silverEditValue = ref(0);

// 职业列表

const professions = ref([
  { value: "鬼王", label: "鬼王", color: "#ff4d4f", hoverColor: "#ff7875", lightColor: "#fff1f0" },
  { value: "灵汐", label: "灵汐", color: "#52c41a", hoverColor: "#73d13d", lightColor: "#f6ffed" },
  { value: "青云", label: "青云", color: "#1890ff", hoverColor: "#40a9ff", lightColor: "#e6f7ff" },
  { value: "焚香", label: "焚香", color: "#fa8c16", hoverColor: "#ffa940", lightColor: "#fff7e6" },
  { value: "合欢", label: "合欢", color: "#722ed1", hoverColor: "#9254de", lightColor: "#f9f0ff" },
]);

// 获取职业对应的样式
const getProfessionStyle = (profession: string) => {
  const found = professions.value.find((p) => p.value === profession);
  if (!found) return {};
  return {
    backgroundColor: found.color,
    borderColor: found.color
  };
};

// 预定义任务
const predefinedTasks = ref<PredefinedTasks>({
  dungeon: [
    {
      name: "小本5连",
      size: 5,
      difficulty: "hard",
      displayName: "5人小本5连",
      selected: false,
    },
    {
      name: "大本6+1",
      size: 5,
      difficulty: "nightmare",
      displayName: "5人大本6+1",
      selected: false,
    },
    {
      name: "云沙锁黄昏",
      size: 10,
      difficulty: "hard",
      displayName: "10人云沙锁黄昏",
      selected: false,
    },
    {
      name: "渡厄炼血堂",
      size: 10,
      difficulty: "hard",
      displayName: "10人渡厄炼血堂",
      selected: false,
    },
    {
      name: "幽劫死灵渊",
      size: 10,
      difficulty: "hard",
      displayName: "10人幽劫死灵渊",
      selected: false,
    },
    {
      name: "云沙锁黄昏",
      size: 10,
      difficulty: "nightmare",
      displayName: "10人云沙锁黄昏",
      selected: false,
    },
    {
      name: "渡厄炼血堂",
      size: 10,
      difficulty: "nightmare",
      displayName: "10人渡厄炼血堂",
      selected: false,
    },
    {
      name: "幽劫死灵渊",
      size: 10,
      difficulty: "nightmare",
      displayName: "10人幽劫死灵渊",
      selected: false,
    },
    {
      name: "云沙锁黄昏",
      size: 20,
      difficulty: "hard",
      displayName: "20人云沙锁黄昏",
      selected: false,
    },
    {
      name: "渡厄炼血堂",
      size: 20,
      difficulty: "hard",
      displayName: "20人渡厄炼血堂",
      selected: false,
    },
    {
      name: "幽劫死灵渊",
      size: 20,
      difficulty: "hard",
      displayName: "20人幽劫死灵渊",
      selected: false,
    },
  ],
  guild: [
    { name: "帮战", selected: false },
    { name: "帮派钓鱼", selected: false },
    { name: "帮派BOSS", selected: false },
    { name: "帮派周奖励", selected: false }
  ],
  world: [
    { name: "世界BOSS", selected: false },
    { name: "邪枭任务", selected: false },
    { name: "风云任务", selected: false },
  ],
  other: [
    { name: "璇玑宝库", selected: false },
    { name: "北荒战云", selected: false },
    { name: "周活跃奖励", selected: false },
    { name: "风华值周奖励", selected: false },
  ],
  vitality: [
    { name: "活力消耗", selected: false },
    { name: "钓鱼", selected: false },
    { name: "烹饪", selected: false },
    { name: "炼药", selected: false },
    { name: "雕刻", selected: false },
    { name: "锻造", selected: false },
    { name: "缝纫", selected: false },
    { name: "挖矿", selected: false },
    { name: "采摘", selected: false },
  ],
  activity: [
    { name: "植树节活动", selected: false },
  ],
});

// 计算属性
const currentRole = computed(() => {
  if (
    currentRoleIndex.value >= 0 &&
    currentRoleIndex.value < roles.value.length
  ) {
    return roles.value[currentRoleIndex.value];
  }
  return null;
});

// 排序后的任务列表（已完成的任务放在最后）
const sortedTasks = computed(() => {
  if (!currentRole.value || !currentRole.value.tasks) return [];

  // 按照分类顺序排序：副本、帮派、世界、其他、活力、自定义
  const categoryOrder = {
    dungeon: 1,
    guild: 2,
    world: 3,
    other: 4,
    vitality: 5,
    activity: 6,
    custom: 7,
  };

  return [...currentRole.value.tasks].sort((a, b) => {
    // 首先按照完成状态排序（未完成的在前，已完成的在后）
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // 然后按照分类顺序排序
    if (a.category !== b.category) {
      return categoryOrder[a.category] - categoryOrder[b.category];
    }

    // 如果是副本任务，按照人数和难度排序
    if (a.category === 'dungeon' && b.category === 'dungeon') {
      // 首先按人数排序
      if (a.originalTask.size !== b.originalTask.size) {
        return a.originalTask.size - b.originalTask.size;
      }
      // 人数相同时，按难度排序（困难在前，噩梦在后）
      if (a.originalTask.difficulty !== b.originalTask.difficulty) {
        return a.originalTask.difficulty === 'hard' ? -1 : 1;
      }
      // 难度相同时，按名称排序
      return a.name.localeCompare(b.name);
    }

    // 其他类型的任务按名称排序
    return a.name.localeCompare(b.name);
  });
});

// 按人数排序的副本任务
const sortedDungeonTasks = computed(() => {
  return [...predefinedTasks.value.dungeon].sort((a, b) => {
    // 首先按人数排序
    if (a.size !== b.size) {
      return a.size - b.size;
    }
    // 人数相同时，按难度排序（困难在前，噩梦在后）
    if (a.difficulty !== b.difficulty) {
      return a.difficulty === "hard" ? -1 : 1;
    }
    // 难度相同时，按名称排序
    return a.name.localeCompare(b.name);
  });
});

// 下次重置日期计算
const nextResetDate = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0是周日，3是周三
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + daysUntilWednesday);
  nextWednesday.setHours(0, 0, 0, 0);

  return nextWednesday.toLocaleDateString("zh-CN");
});

const daysUntilReset = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return (3 - dayOfWeek + 7) % 7 || 7; // 如果今天是周三，返回7
});

// 获取任务在原始数组中的索引
const getOriginalIndex = (task) => {
  return currentRole.value.tasks.findIndex((t) => t.id === task.id);
};

// 方法
const loadData = async (isUpdateNoData = true) => {
  if (isLoggedIn.value) {
    try {
      const response = await fetch('/api/data/sync', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });
      const data = await response.json();

      if (response.ok) {

        if (!isUpdateNoData && data.roles.length === 0) return;

        // 更新内存中的数据
        roles.value = data.roles || [];
        localStorage.setItem('roleTaskManager', JSON.stringify(data.roles || []));

        // 更新当前选中的角色
        if (roles.value.length > 0) {
          currentRoleIndex.value = 0;
          silverEditValue.value = roles.value[0].silver || 0;
        }

        return;
      }
    } catch (error) {
      console.error('获取服务器数据失败:', error);
    }
  }

  // 如果未登录或获取服务器数据失败，使用本地存储的数据
  const savedRoles = localStorage.getItem('roleTaskManager');
  if (savedRoles) {
    roles.value = JSON.parse(savedRoles);
    if (roles.value.length > 0) {
      currentRoleIndex.value = 0;
      silverEditValue.value = roles.value[0].silver || 0;
    }
  }
};

// 创建一个防抖的同步函数
const syncDataToServer = debounce(async () => {
  if (isLoggedIn.value) {
    try {
      const response = await fetch('/api/data/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          roles: roles.value
        })
      });

      if (!response.ok) {
        console.error('同步到服务器失败');
        if (response.status === 401) {
          logout();
          message.error('登录已过期，请重新登录');
        }
      }
    } catch (error) {
      console.error('同步数据失败:', error);
    }
  }
}, 2000); // 2秒的防抖延迟

// 修改 saveData 函数
const saveData = () => {
  // 保存到本地存储
  localStorage.setItem('roleTaskManager', JSON.stringify(roles.value));

  // 使用防抖的同步函数
  syncDataToServer();
};

const openAddRoleForm = () => {
  showEditRoleForm.value = false; // 关闭编辑表单
  showAddRoleForm.value = true;
  // 重置newRole的值
  newRole.value = {
    id: 0,
    name: "",
    description: "",
    profession: "",
    silver: 0,
    tasks: []
  };
};

const cancelAddRoleForm = () => {
  showAddRoleForm.value = false;
  // 重置newRole的值
  newRole.value = {
    id: 0,
    name: "",
    description: "",
    profession: "",
    silver: 0,
    tasks: []
  };
};

const handleAddRole = (roleData: Role) => {
  if (!roleData.name.trim()) {
    message.warning('角色名称不能为空');
    return;
  }

  const newRoleData = {
    id: roles.value.length + 1,
    name: roleData.name.trim(),
    description: roleData.description || '',
    profession: roleData.profession,
    silver: 0,
    tasks: []
  };

  roles.value.push(newRoleData);
  message.success('角色添加成功');
  newRole.value = {
    id: 0,
    name: '',
    description: '',
    profession: '',
    silver: 0,
    tasks: []
  };
  showAddRoleForm.value = false; // 关闭添加角色表单
};

const handleSelectRole = (index: number) => {
  currentRoleIndex.value = index;
  if (roles.value[index] && roles.value[index].silver !== undefined) {
    silverEditValue.value = roles.value[index].silver;
  } else {
    silverEditValue.value = 0;
  }
  // 关闭新增和编辑角色的表单
  showAddRoleForm.value = false;
  showEditRoleForm.value = false;
  // 关闭任务编辑表单
  showTaskForm.value = false;
  isEditingTask.value = false;
  editingTaskIndex.value = -1;
  newTask.value = { name: "" };
};

const deleteRole = () => {
  if (currentRole.value && confirm(`确定要删除角色 "${currentRole.value.name}" 吗？`)) {
    roles.value.splice(currentRoleIndex.value, 1);
    if (roles.value.length > 0) {
      currentRoleIndex.value = 0;
    } else {
      currentRoleIndex.value = -1;
    }
    saveData();
    message.success('角色删除成功');
  }
};

const addTask = () => {
  if (!newTask.value.name.trim()) {
    alert("任务名称不能为空");
    return;
  }

  // 如果是编辑模式，调用updateTask方法
  if (isEditingTask.value && editingTaskIndex.value >= 0) {
    updateTask();
    return;
  }

  const task = {
    id: Date.now(),
    name: newTask.value.name,
    completed: false,
    category: "custom",
    originalTask: { name: newTask.value.name },
  };

  currentRole.value.tasks.push(task);
  newTask.value = { name: "" };
  showAddTaskForm.value = false;
  saveData();
};

const openAddTaskForm = () => {
  showAddTaskForm.value = true;
  isEditingTask.value = true; // 修改为 true，表示进入编辑模式
  editingTaskIndex.value = -1;
  newTask.value = { name: "", category: "custom" };

  // 重置所有预定义任务的选中状态
  Object.keys(predefinedTasks.value).forEach((category) => {
    predefinedTasks.value[category].forEach((task) => {
      task.selected = false;
    });
  });

  // 如果当前角色已有任务，则反映之前选择的选项
  if (currentRole.value && currentRole.value.tasks.length > 0) {
    // 遍历当前角色的所有任务
    currentRole.value.tasks.forEach((roleTask) => {
      // 只处理非自定义任务
      if (roleTask.category !== "custom" && roleTask.originalTask) {
        // 根据任务类别找到对应的预定义任务列表
        const categoryTasks =
          predefinedTasks.value[roleTask.category];
        if (categoryTasks) {
          // 对于副本任务，需要匹配名称、人数和难度
          if (roleTask.category === "dungeon") {
            const matchingTask = categoryTasks.find(
              (task) =>
                task.name === roleTask.originalTask.name &&
                task.size === roleTask.originalTask.size &&
                task.difficulty === roleTask.originalTask.difficulty
            );
            if (matchingTask) {
              matchingTask.selected = true;
            }
          } else {
            // 对于其他类型任务，只需匹配名称
            const matchingTask = categoryTasks.find(
              (task) => task.name === roleTask.originalTask.name
            );
            if (matchingTask) {
              matchingTask.selected = true;
            }
          }
        }
      }
    });
  }
};

const handleCancelTaskForm = () => {
  showTaskForm.value = false;
  isEditingTask.value = false;
  editingTaskIndex.value = -1;
  newTask.value = { name: "" };
  // 重置所有预定义任务的选中状态
  Object.keys(predefinedTasks.value).forEach((category) => {
    predefinedTasks.value[category].forEach((task) => {
      task.selected = false;
    });
  });
};

const editTask = (taskIndex: number, newName?: string) => {
  console.log('editTask called with index:', taskIndex, 'newName:', newName);
  console.log('currentRole:', currentRole.value);
  
  // 如果任务索引为-1，说明是点击了编辑任务按钮
  if (taskIndex === -1) {
    showTaskForm.value = true;
    isEditingTask.value = false;
    editingTaskIndex.value = -1;
    editingTaskName.value = '';
    isEditingCustomTask.value = false;
    
    // 重置所有预定义任务的选中状态
    Object.keys(predefinedTasks.value).forEach((category) => {
      predefinedTasks.value[category].forEach((task) => {
        task.selected = false;
      });
    });
    
    // 遍历当前角色的所有任务，将固定任务设置为选中状态
    if (currentRole.value && currentRole.value.tasks) {
      currentRole.value.tasks.forEach((roleTask) => {
        if (roleTask.category !== "custom" && roleTask.originalTask) {
          const categoryTasks = predefinedTasks.value[roleTask.category];
          if (categoryTasks) {
            if (roleTask.category === "dungeon") {
              const matchingTask = categoryTasks.find(
                (t) =>
                  t.name === roleTask.originalTask.name &&
                  t.size === roleTask.originalTask.size &&
                  t.difficulty === roleTask.originalTask.difficulty
              );
              if (matchingTask) {
                console.log('Setting dungeon task selected:', matchingTask.name);
                matchingTask.selected = true;
              }
            } else {
              const matchingTask = categoryTasks.find(
                (t) => t.name === roleTask.originalTask.name
              );
              if (matchingTask) {
                console.log('Setting task selected:', matchingTask.name);
                matchingTask.selected = true;
              }
            }
          }
        }
      });
    }
    return;
  }
  
  // 如果是点击单个任务的编辑按钮
  const task = currentRole.value?.tasks[taskIndex];
  if (!task) {
    console.log('Task not found');
    return;
  }
  
  // 只允许编辑自定义任务
  if (task.category !== "custom") {
    message.warning('固定任务不允许编辑');
    return;
  }

  // 如果有新名称，更新任务名称
  if (newName) {
    task.name = newName;
    task.originalTask = { name: newName };
    saveData();
    message.success('任务更新成功');
  } else {
    // 开始行内编辑
    task.isEditing = true;
    task.editName = task.name;
  }
};

const updateTask = () => {
  if (!newTask.value.name.trim()) {
    alert("任务名称不能为空");
    return;
  }

  if (
    editingTaskIndex.value >= 0 &&
    editingTaskIndex.value < currentRole.value.tasks.length
  ) {
    // 更新任务名称，但保留其他属性
    const task = currentRole.value.tasks[editingTaskIndex.value];
    task.name = newTask.value.name;

    // 如果是自定义任务，同时更新originalTask
    if (task.category === "custom") {
      task.originalTask = { name: newTask.value.name };
    }

    saveData();
    showAddTaskForm.value = false;
    isEditingTask.value = false;
    editingTaskIndex.value = -1;
    newTask.value = { name: "" };
  }
};

// 添加选中的预定义任务
const handleAddSelectedTasks = (selectedTasks: PredefinedTask[]) => {
  if (!currentRole.value) return;

  // 创建一个映射，记录当前选中的固定任务
  const selectedTasksMap = {};

  selectedTasks.forEach(task => {
    // 对于副本任务，使用名称+人数+难度作为键
    if (task.category === "dungeon") {
      const key = `${task.category}-${task.name}-${task.size}-${task.difficulty}`;
      selectedTasksMap[key] = task;
    } else {
      // 对于其他任务，使用分类+名称作为键
      const key = `${task.category}-${task.name}`;
      selectedTasksMap[key] = task;
    }
  });

  // 过滤掉未选中的固定任务
  const filteredTasks = currentRole.value.tasks.filter((task) => {
    // 保留所有自定义任务
    if (task.category === "custom") {
      return true;
    }

    // 检查固定任务是否在选中列表中
    if (task.originalTask) {
      if (task.category === "dungeon") {
        const key = `${task.category}-${task.originalTask.name}-${task.originalTask.size}-${task.originalTask.difficulty}`;
        return selectedTasksMap[key];
      } else {
        const key = `${task.category}-${task.originalTask.name}`;
        return selectedTasksMap[key];
      }
    }

    return false; // 如果没有originalTask信息，不保留
  });

  // 添加新选中的任务（只添加不存在的任务）
  Object.values(selectedTasksMap).forEach(task => {
    const taskKey = task.category === "dungeon"
      ? `${task.category}-${task.name}-${task.size}-${task.difficulty}`
      : `${task.category}-${task.name}`;

    // 检查任务是否已存在
    const taskExists = filteredTasks.some(existingTask => {
      if (existingTask.category === "dungeon") {
        return `${existingTask.category}-${existingTask.originalTask.name}-${existingTask.originalTask.size}-${existingTask.originalTask.difficulty}` === taskKey;
      } else {
        return `${existingTask.category}-${existingTask.originalTask.name}` === taskKey;
      }
    });

    // 如果任务不存在，则添加
    if (!taskExists) {
      const taskName = task.size
        ? `${task.size}人${task.name}（${getDifficultyText(task.difficulty)}）`
        : task.name;

      const newTask = {
        id: Date.now() + Math.random(),
        name: taskName,
        completed: false,
        category: task.category,
        originalTask: task,
      };

      filteredTasks.push(newTask);
    }
  });

  // 更新任务列表
  currentRole.value.tasks = filteredTasks;
  saveData();
  showTaskForm.value = false;
  isEditingTask.value = false;
  editingTaskIndex.value = -1;
};

// 获取副本难度对应的文本
const getDifficultyText = (difficulty: string): string => {
  if (difficulty === "hard") return "困难";
  if (difficulty === "nightmare") return "噩梦";
  return "";
};

const handleToggleTaskStatus = (taskIndex: number) => {
  console.log('handleToggleTaskStatus called with index:', taskIndex);
  if (!currentRole.value || !currentRole.value.tasks) {
    console.log('No current role or tasks');
    return;
  }
  
  const task = currentRole.value.tasks[taskIndex];
  if (!task) {
    console.log('Task not found at index:', taskIndex);
    return;
  }
  
  console.log('Current task status:', task.completed);
  // 更新任务状态
  task.completed = !task.completed;
  console.log('New task status:', task.completed);
  
  // 强制更新数组以触发视图更新
  currentRole.value.tasks = [...currentRole.value.tasks];
  console.log('Tasks array updated');
  
  // 保存更改
  saveData();
  console.log('Changes saved');
};

const deleteTask = (taskIndex: number) => {
  if (currentRole.value && currentRole.value.tasks) {
    currentRole.value.tasks.splice(taskIndex, 1);
    saveData();
  }
};

// 行内编辑相关方法
const handleStartInlineEdit = (taskIndex: number) => {
  if (currentRole.value && currentRole.value.tasks) {
    const task = currentRole.value.tasks[taskIndex];
    if (task.category !== "custom") {
      message.warning('固定任务不允许编辑');
      return;
    }
    task.isEditing = true;
    task.editName = task.name;
  }
};

const handleSaveInlineEdit = (taskIndex: number) => {
  if (currentRole.value && currentRole.value.tasks) {
    const task = currentRole.value.tasks[taskIndex];
    if (!task.editName || !task.editName.trim()) {
      message.warning('任务名称不能为空');
      return;
    }
    
    // 更新任务名称
    task.name = task.editName.trim();
    
    // 如果是自定义任务，同时更新 originalTask
    if (task.category === "custom") {
      task.originalTask = { name: task.name };
    }
    
    // 退出编辑状态
    task.isEditing = false;
    delete task.editName;
    
    // 保存更改
    saveData();
    message.success('任务更新成功');
  }
};

const handleCancelInlineEdit = (taskIndex: number) => {
  if (currentRole.value && currentRole.value.tasks) {
    const task = currentRole.value.tasks[taskIndex];
    task.isEditing = false;
    delete task.editName;
  }
};

const calculateProgress = (role: Role): number => {
  if (!role || !role.tasks || role.tasks.length === 0) {
    return 0;
  }

  const completedTasks = role.tasks.filter(
    (task: Task) => task.completed
  ).length;
  return Math.round((completedTasks / role.tasks.length) * 100);
};

const checkResetDay = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();

  // 检查是否是周三早上8点
  if (dayOfWeek === 3 && hours >= 8) {
    const lastResetDate = localStorage.getItem("lastResetDate");
    const today = now.toISOString().split('T')[0];
    // 如果今天还没有重置
    if (lastResetDate !== today) {
      // 重置所有任务
      roles.value.forEach((role) => {
        if (role.tasks) {
          role.tasks.forEach((task) => {
            task.completed = false;
          });
        }
      });

      // 保存重置日期
      localStorage.setItem("lastResetDate", today);
      saveData();
      console.log("任务已重置");
    }
  }
};

const editRole = () => {
  if (!currentRole.value) return;

  showAddRoleForm.value = false; // 关闭新增表单
  showEditRoleForm.value = true;
  editingRole.value = {
    name: currentRole.value.name,
    description: currentRole.value.description,
    profession: currentRole.value.profession,
    silver: currentRole.value.silver,
  };
};

const saveEditedRole = (role: Role) => {
  if (!role.name.trim()) {
    message.warning('角色名称不能为空');
    return;
  }

  if (currentRoleIndex.value !== null && currentRole.value) {
    roles.value[currentRoleIndex.value] = {
      ...currentRole.value,
      name: role.name.trim(),
      description: role.description || '',
      profession: role.profession,
      silver: role.silver || 0,
    };
    showEditRoleForm.value = false;
    saveData();
    message.success('角色修改成功');
  }
};

const cancelEditRole = () => {
  showEditRoleForm.value = false;
};

// 添加更新银两的方法
const updateSilver = () => {
  if (currentRole.value) {
    currentRole.value.silver = Number(silverEditValue.value) || 0;
    saveData();
  }
};

// 导出数据
const exportData = () => {
  const data = {
    roles: roles.value,
    lastResetDate: localStorage.getItem("lastResetDate")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `role-task-manager-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 导入数据
const importData = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target && target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const data = JSON.parse(result);
            if (data.roles && Array.isArray(data.roles)) {
              roles.value = data.roles;
              if (data.lastResetDate) {
                localStorage.setItem("lastResetDate", data.lastResetDate);
              }
              currentRoleIndex.value = roles.value.length > 0 ? 0 : -1;
              saveData();
              message.success('数据导入成功！');
            } else {
              message.error('无效的数据格式！');
            }
          }
        } catch (error) {
          console.error("导入数据时出错：", error);
          message.error('导入数据时出错，请确保文件格式正确！');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// 监听数据变化
watch(
  roles,
  () => {
    saveData();
  },
  { deep: true }
);

// 确保watch监听currentRole变化时更新银两值
watch(currentRole, (newRole) => {
  if (newRole) {
    silverEditValue.value = newRole.silver || 0;
  }
});

// 添加缺失的响应式变量
const showTaskForm = ref(false);
const isEditingCustomTask = ref(false);
const editingTaskName = ref("");

const handleAddCustomTask = (taskName: string) => {
  if (!taskName.trim()) {
    message.warning('任务名称不能为空');
    return;
  }

  if (currentRole.value) {
    const task = {
      id: Date.now(),
      name: taskName.trim(),
      completed: false,
      category: "custom",
      originalTask: { name: taskName.trim() },
    };

    currentRole.value.tasks.push(task);
    saveData();
    showTaskForm.value = false;
    message.success('任务添加成功');
  }
};

const handleDeleteTask = (taskIndex: number) => {
  if (currentRole.value && currentRole.value.tasks) {
    currentRole.value.tasks.splice(taskIndex, 1);
    saveData();
  }
};

// 添加恢复删除任务的方法
const handleRestoreTask = (taskIndex: number, task: Task) => {
  if (currentRole.value && currentRole.value.tasks) {
    currentRole.value.tasks.splice(taskIndex, 0, task);
    saveData();
  }
};

// 添加处理任务重排序的方法
const handleReorderTasks = (tasks: Task[]) => {
  if (currentRole.value) {
    currentRole.value.tasks = tasks;
    saveData();
  }
};
</script>

<template>
  <div class="app-container">
    <LoginModal v-model:showLoginModal="showLoginModal" @login="handleLogin" />

    <Header :isLoggedIn="isLoggedIn" :showAddRoleForm="showAddRoleForm" @login="showLoginModal = true"
      @addRole="openAddRoleForm" @cancelAddRole="showAddRoleForm = false" @exportData="exportData"
      @importData="importData" />

    <div class="main-content">
      <a-card v-if="showAddRoleForm" class="add-role-section">
        <template #title>
          <div class="section-header">
            <span>添加角色</span>
          </div>
        </template>
        <RoleForm :initial-role="newRole" @submit="handleAddRole" @cancel="() => showAddRoleForm = false" />
      </a-card>

      <a-card v-if="showEditRoleForm" class="edit-role-section">
        <template #title>
          <div class="section-header">
            <span>编辑角色</span>
          </div>
        </template>
        <RoleForm :initial-role="editingRole" :is-edit="true" @submit="saveEditedRole"
          @cancel="() => showEditRoleForm = false" />
      </a-card>

      <div class="role-management">
        <div class="left-panel">
          <RoleList :roles="roles" :currentRoleIndex="currentRoleIndex" :calculateProgress="calculateProgress"
            @select="handleSelectRole" />
        </div>

        <div class="right-panel" v-if="currentRole">
          <!-- 角色信息模块 -->
          <a-card class="role-info">
            <template #title>
              <div class="section-header">
                <span>角色信息</span>
                <div class="role-actions">
                  <a-button type="primary" @click="editRole" v-if="!showEditRoleForm">编辑角色</a-button>
                  <a-button type="primary" danger @click="cancelEditRole" v-if="showEditRoleForm">取消编辑</a-button>
                  <a-button type="primary" danger @click="deleteRole">删除角色</a-button>
                </div>
              </div>
            </template>
            <div class="role-details">
              <div class="role-info-left">
                <div class="role-info-left-top">
                <h2 class="role-title">{{ currentRole.name }}</h2>
                <a-tag v-if="currentRole.profession" class="profession-tag" :style="getProfessionStyle(currentRole.profession)">
                  {{ currentRole.profession }}
                  </a-tag>
                </div>
                <div class="role-info-left-bottom">
                  <div class="role-silver">
                    <label>银两：</label>
                    <a-input-number v-model:value="silverEditValue" @change="updateSilver" class="silver-input" :min="0"
                    :step="1" />
                    <span class="silver-unit">万两</span>
                  </div>
                </div>
              </div>
              <div class="role-info-right">
                <p v-if="currentRole.description" class="role-description">
                  {{ currentRole.description }}
                </p>
              </div>
            </div>
          </a-card>

          <!-- 任务列表和表单 -->
          <div class="task-container">
            <div class="task-content">
              <TaskForm v-if="showTaskForm" 
                :isEdit="isEditingTask" 
                :predefinedTasks="predefinedTasks"
                :isEditingCustomTask="isEditingCustomTask" 
                :initialTaskName="editingTaskName"
                @cancel="handleCancelTaskForm" 
                @addSelectedTasks="handleAddSelectedTasks"
                @addCustomTask="handleAddCustomTask" />
              <TaskList v-else :tasks="currentRole.tasks" @edit="editTask"
                @toggle="handleToggleTaskStatus" @startInlineEdit="handleStartInlineEdit"
                @saveInlineEdit="handleSaveInlineEdit" @cancelInlineEdit="handleCancelInlineEdit"
                @delete="handleDeleteTask" @restore="handleRestoreTask" @reorder="handleReorderTasks" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局样式 */
:root {
  height: 100%;
}

body {
  margin: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

/* 添加角色表单区域 */
.add-role-section {
  width: 100%;
}

/* 角色管理区域 */
.role-management {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.left-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.left-panel :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-panel :deep(.ant-card-head) {
  flex-shrink: 0;
}

.left-panel :deep(.ant-card-body) {
  flex: 1;
  padding-top: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

/* 角色信息和任务列表模块 */
.role-info {
  margin-bottom: 0;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0;
}

.module-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.role-details {
  display: flex;
  gap: 24px;
}

.role-info-left {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-info-left-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-info-left-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.role-info-right {
  flex: 2;
  border-left: 1px solid #f0f0f0;
  padding-left: 24px;
  height: 100%;
  max-height: 100px;
  padding-right: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 0;
}

.role-info-right::-webkit-scrollbar {
  width: 6px;
}

.role-info-right::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.role-info-right::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.role-info-right::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.role-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.65);
  white-space: pre-wrap;
}

.role-silver {
  display: flex;
  align-items: center;
  gap: 8px;
}

.silver-input {
  width: 120px;
}

.silver-unit {
  color: rgba(0, 0, 0, 0.45);
}

.role-actions {
  display: flex;
  gap: 8px;
}

.task-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.task-content {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
  flex-shrink: 0;
}

.task-header .module-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

:deep(.task-list::-webkit-scrollbar) {
  width: 6px;
}

:deep(.task-list::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.task-list::-webkit-scrollbar-thumb) {
  background: #ccc;
  border-radius: 3px;
}

:deep(.task-list::-webkit-scrollbar-thumb:hover) {
  background: #999;
}

</style>
