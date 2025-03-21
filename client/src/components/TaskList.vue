<template>
  <a-card class="task-list-card">
    <template #title>
      <div class="list-header">
        <span>任务列表</span>
        <div class="task-list-header-actions">
          <template v-if="tasks.length > 0">
            <a-button 
              :type="isSorting ? 'primary' : 'default'" 
              @click="toggleSorting"
              :danger="isSorting"
            >
              {{ isSorting ? '完成排序' : '任务排序' }}
            </a-button>
            <a-button type="primary" @click="$emit('edit', -1)" v-if="!isSorting">
              编辑任务
            </a-button>
          </template>
          <a-button type="primary" @click="$emit('edit', -1)" v-if="tasks.length === 0">
            新增任务
          </a-button>
        </div>
      </div>
    </template>
    <div class="task-list-container">
      <template v-if="tasks.length > 0">
        <VueDraggable 
          v-model="taskList"
          class="task-list"
          handle=".task-item"
          :animation="150"
          item-key="id"
          :disabled="!isSorting"
        >
          <template #item="{ element: task }">
            <div 
              class="task-item" 
              :class="{ 'sortable': isSorting }"
              @click.stop="handleTaskClick(task, $event)"
            >
              <div class="task-content">
                <div class="drag-handle" v-if="isSorting">
                  <MenuOutlined style="font-size: 16px;" />
                </div>
                <div class="checkbox-wrapper" v-if="!isSorting">
                  <input type="checkbox" class="task-checkbox" :checked="task.completed">
                </div>
                <template v-if="editingTaskId === task.id">
                  <a-input
                    v-model:value="editingTaskName"
                    @pressEnter="handleSaveEdit(task)"
                    @blur="handleBlur"
                    @mousedown.stop
                    ref="editInputRef"
                  />
                </template>
                <template v-else>
                  <div class="task-content">
                    <a-tag :color="getCategoryColor(task.category)">{{ getCategoryText(task.category) }}</a-tag>
                    <span :class="{ completed: task.completed }">{{ task.name }}</span>
                  </div>
                </template>
              </div>
              <div class="task-actions" v-if="!isSorting">
                <template v-if="editingTaskId === task.id">
                  <a-button type="text" @mousedown.stop.prevent="handleSaveEdit(task)">
                    <template #icon><CheckOutlined /></template>
                  </a-button>
                  <a-button type="text" @mousedown.stop.prevent="handleCancelEdit">
                    <template #icon><CloseOutlined /></template>
                  </a-button>
                </template>
                <template v-else>
                  <a-button type="text" @mousedown.stop.prevent="handleEditTask(task)" v-if="task.category === 'custom'">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                  <a-button type="text" danger @mousedown.stop.prevent="handleDeleteTask(task)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </template>
              </div>
            </div>
          </template>
        </VueDraggable>
      </template>
      <template v-else>
        <a-empty description="暂无任务" />
      </template>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref, h, nextTick } from 'vue';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, MenuOutlined, DragOutlined } from '@ant-design/icons-vue';
import { notification, Button } from 'ant-design-vue';
import VueDraggable from 'vuedraggable';

interface Task {
  id: number;
  name: string;
  completed: boolean;
  category: string;
  size?: number;
  difficulty?: string;
  originalTask?: {
    name: string;
    size?: number;
    difficulty?: 'hard' | 'nightmare';
  };
  order?: number;
}

const props = defineProps<{
  tasks: Task[];
  isSorting?: boolean;
}>();

const emit = defineEmits<{
  'toggle': [index: number];
  'edit': [index: number, newName?: string];
  'delete': [index: number];
  'restore': [index: number, task: Task];
  'reorder': [tasks: Task[]];
  'update:isSorting': [value: boolean];
}>();

// 添加排序状态
const localIsSorting = computed({
  get: () => props.isSorting ?? false,
  set: (value) => {
    emit('update:isSorting', value);
  }
});

// 添加临时排序状态
const tempTaskList = ref<Task[]>([]);

// 修改拖拽相关的计算属性
const taskList = computed({
  get: () => {
    if (localIsSorting.value) {
      // 排序模式下，直接使用临时列表，不区分完成状态
      return tempTaskList.value;
    } else {
      // 非排序模式下，按照完成状态和排序字段分组
      const tasks = [...props.tasks];
      const uncompletedTasks = tasks.filter(task => !task.completed);
      const completedTasks = tasks.filter(task => task.completed);

      // 对未完成任务按照 order 排序
      uncompletedTasks.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });

      // 对已完成任务按照 order 排序
      completedTasks.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });

      // 未完成任务在前，已完成任务在后
      return [...uncompletedTasks, ...completedTasks];
    }
  },
  set: (value) => {
    if (!localIsSorting.value) return;
    // 排序模式下，更新临时列表
    tempTaskList.value = value;
  }
});

// 切换排序状态
const toggleSorting = () => {
  if (!localIsSorting.value) {
    // 进入排序模式时，初始化临时列表，保持原有顺序
    tempTaskList.value = [...props.tasks].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });
  } else {
    // 退出排序模式时，保存当前顺序
    const updatedTasks = tempTaskList.value.map((task, index) => ({
      ...task,
      order: index
    }));
    emit('reorder', updatedTasks);
  }
  localIsSorting.value = !localIsSorting.value;
};

// 添加撤回相关的状态
interface DeletedTask {
  task: Task;
  index: number;
  key: string;
}

const deletedTasks = ref<DeletedTask[]>([]);

const handleTaskClick = (task: Task, event: Event) => {
  if (localIsSorting.value) return;
  // 如果点击的是按钮、输入框、复选框或其子元素，不处理点击事件
  const target = event.target as HTMLElement;
  if (
    target.closest('.task-actions') ||
    target.closest('.ant-checkbox') ||
    target.closest('.ant-input') ||
    editingTaskId.value === task.id
  ) {
    return;
  }

  const index = getOriginalIndex(task);
  if (index !== -1) {
    emit('toggle', index);
  }
};

const getOriginalIndex = (task: Task) => {
  return props.tasks.findIndex(t => t.id === task.id);
};

const getCategoryText = (category: string) => {
  const categories: { [key: string]: string } = {
    dungeon: '副本',
    guild: '帮派',
    world: '世界',
    other: '其他',
    vitality: '活力',
    activity: '限时',
    custom: '自定义',
  };
  return categories[category] || category;
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    dungeon: 'red',
    guild: 'orange',
    world: 'blue',
    other: 'green',
    vitality: 'purple',
    activity: 'cyan',
    custom: 'default',
  };
  return colors[category] || 'default';
};

// 删除任务的方法
const handleDeleteTask = (task: Task) => {
  const index = getOriginalIndex(task);
  if (index === -1) return;

  // 生成唯一的通知 key
  const key = `undo${Date.now()}`;

  // 保存被删除的任务信息
  deletedTasks.value.push({
    task,
    index,
    key,
  });

  // 发出删除事件
  emit('delete', index);

  // 显示撤回提示
  notification.open({
    message: `已删除 「${task.name}」`,
    // description: ,
    btn: () =>
      h(
        Button,
        {
          type: 'primary',
          danger: true,
          onClick: () => {
            handleUndoDelete(key);
            notification.close(key);
          },
        },
        { default: () => '撤回' },
      ),
    key,
    duration: 5,
    placement: 'topRight',
    class: 'undo-notification',
  });
};

// 撤回删除的方法
const handleUndoDelete = (key: string) => {
  const deletedTask = deletedTasks.value.find(item => item.key === key);
  if (deletedTask) {
    // 发出恢复事件
    emit('restore', deletedTask.index, deletedTask.task);

    // 从数组中移除该任务
    deletedTasks.value = deletedTasks.value.filter(item => item.key !== key);
  }
};

// 编辑状态相关
const editingTaskId = ref<number | null>(null);
const editingTaskName = ref<string>('');
const editInputRef = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);

// 开始编辑任务
const handleEditTask = (task: Task) => {
  console.log('开始编辑任务:', task);
  editingTaskId.value = task.id;
  editingTaskName.value = task.name;
  isSaving.value = false;
  nextTick(() => {
    editInputRef.value?.focus();
  });
};

// 处理输入框失焦
const handleBlur = () => {
  console.log('输入框失焦');
  // 如果正在保存，不处理失焦事件
  if (isSaving.value) {
    return;
  }
  handleCancelEdit();
};

// 保存编辑
const handleSaveEdit = (task: Task) => {
  console.log('保存编辑:', task);
  isSaving.value = true;
  const newName = editingTaskName.value.trim();
  if (newName) {
    const index = getOriginalIndex(task);
    if (index !== -1) {
      console.log('找到任务索引:', index);
      emit('edit', index, newName);
    }
  }
  handleCancelEdit();
};

// 取消编辑
const handleCancelEdit = () => {
  console.log('取消编辑');
  editingTaskId.value = null;
  editingTaskName.value = '';
  isSaving.value = false;
};

// 添加 handleCheckboxClick 方法
const handleCheckboxClick = (task: Task) => {
  const index = getOriginalIndex(task);
  if (index !== -1) {
    emit('toggle', index);
  }
};
</script>

<style scoped>
.task-list-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-list-card :deep(.ant-card-body) {
  flex: 1;
  padding: 0 !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
}

.task-list {
  flex: 1;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.task-list-header-actions {
  display: flex;
  gap: 8px;
}

.task-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-content :deep(.ant-input) {
  width: 200px;
}

.completed {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.45);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.task-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-right: 1rem;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 自定义滚动条样式 */
.task-list::-webkit-scrollbar,
.task-list-container::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track,
.task-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb,
.task-list-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover,
.task-list-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.task-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  /* transition: all 0.2s;
  background-color: #fff; */
}

.task-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.undo-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 320px;
  overflow: hidden;
}

.undo-content {
  padding: 20px;
  position: relative;
}

.undo-message {
  margin-bottom: 16px;
  font-size: 14px;
}

.undo-actions {
  margin-bottom: 12px;
  text-align: center;
}

.undo-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #f0f0f0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #1890ff;
  transition: width 1s linear;
}

.countdown {
  display: block;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  margin-top: 6px;
}

:deep(.undo-notification) {
  .ant-notification-notice {
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: #fff;
    border: 1px solid #f0f0f0;
  }

  .ant-notification-notice-message {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #262626;
  }

  .ant-notification-notice-description {
    font-size: 14px;
    color: #595959;
    line-height: 1.5;
  }

}
</style>