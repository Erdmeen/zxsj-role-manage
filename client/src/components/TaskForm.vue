<template>
  <a-card class="task-form-card">
    <template #title>
      <div class="list-header">
        <span>{{ isEdit ? '编辑任务' : '添加任务' }}</span>
        <a-button type="primary" danger @click="$emit('cancel')">取消</a-button>
      </div>
    </template>
    <div class="task-form-container">
      <div class="task-form">
        <div class="task-form-content">
          <!-- 固定任务区域 -->
          <div class="task-section">
            <div class="section-header">
              <h3>固定任务</h3>
              <a-button type="primary" @click="handleAddSelectedTasks">添加固定任务</a-button>
            </div>
            
            <div class="task-categories">
              <!-- 副本任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>副本</h4>
                  <a-checkbox
                    :checked="dungeonAllSelected"
                    @click="handleSelectAllDungeon"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in sortedDungeonTasks" :key="task.name + task.size + task.difficulty"
                    v-model:checked="task.selected">
                    {{ task.displayName || task.name }}
                    <template v-if="task.difficulty">
                      ({{ task.difficulty === 'hard' ? '困难' : '噩梦' }})
                    </template>
                  </a-checkbox>
                </div>
              </div>

              <!-- 帮派任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>帮派</h4>
                  <a-checkbox
                    :checked="guildAllSelected"
                    @click="handleSelectAllGuild"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in predefinedTasks.guild" :key="task.name" v-model:checked="task.selected">
                    {{ task.name }}
                  </a-checkbox>
                </div>
              </div>

              <!-- 世界任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>世界</h4>
                  <a-checkbox
                    :checked="worldAllSelected"
                    @click="handleSelectAllWorld"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in predefinedTasks.world" :key="task.name" v-model:checked="task.selected">
                    {{ task.name }}
                  </a-checkbox>
                </div>
              </div>

              <!-- 其他任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>其他</h4>
                  <a-checkbox
                    :checked="otherAllSelected"
                    @click="handleSelectAllOther"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in predefinedTasks.other" :key="task.name" v-model:checked="task.selected">
                    {{ task.name }}
                  </a-checkbox>
                </div>
              </div>

              <!-- 活力任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>活力</h4>
                  <a-checkbox
                    :checked="vitalityAllSelected"
                    @click="handleSelectAllVitality"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in predefinedTasks.vitality" :key="task.name" v-model:checked="task.selected">
                    {{ task.name }}
                  </a-checkbox>
                </div>
              </div>

              <!-- 活动任务 -->
              <div class="task-category">
                <div class="category-header">
                  <h4>限时</h4>
                  <a-checkbox
                    :checked="activityAllSelected"
                    @click="handleSelectAllActivity"
                  >全选</a-checkbox>
                </div>
                <div class="task-list">
                  <a-checkbox v-for="task in predefinedTasks.activity" :key="task.name" v-model:checked="task.selected">
                    {{ task.name }}
                  </a-checkbox>
                </div>
              </div>
            </div>
          </div>

          <!-- 自定义任务区域 -->
          <div class="task-section custom-section">
            <div class="section-header">
              <h3>自定义任务</h3>
            </div>
            <div class="task-category">
              <div class="custom-task-input">
                <a-input v-model:value="customTaskName" placeholder="输入任务名称" />
                <a-button type="primary" @click="handleAddCustomTask">添加自定义任务</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';

interface Task {
  name: string;
  size?: number;
  difficulty?: 'hard' | 'nightmare';
  displayName?: string;
  selected?: boolean;
  category: string;
  taskKey: string;
}

interface PredefinedTasks {
  [key: string]: Task[];
}

const props = defineProps<{
  isEdit: boolean;
  predefinedTasks: PredefinedTasks;
  isEditingCustomTask: boolean;
  initialTaskName: string;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'addSelectedTasks', tasks: Task[]): void;
  (e: 'addCustomTask', taskName: string): void;
}>();

const customTaskName = ref('');

// 重置所有任务的选中状态
const resetAllTasks = () => {
  Object.values(props.predefinedTasks).forEach(category => {
    category.forEach(task => {
      task.selected = false;
    });
  });
};

// 添加设置选中状态的方法
const setSelectedTasks = (taskName: string) => {
  console.log('setSelectedTasks called with taskName:', taskName);
  console.log('isEditingCustomTask:', props.isEditingCustomTask);
  
  if (!taskName) {
    console.log('No task name provided');
    return;
  }
  
  // 重置所有任务的选中状态
  resetAllTasks();
  
  if (props.isEditingCustomTask) {
    console.log('Setting custom task name:', taskName);
    customTaskName.value = taskName;
    return;
  }
  
  // 设置当前编辑的任务为选中状态
  Object.entries(props.predefinedTasks).forEach(([category, tasks]) => {
    console.log('Processing category:', category);
    tasks.forEach(task => {
      // 对于副本任务，需要匹配完整的显示名称
      if (category === 'dungeon') {
        const taskDisplayName = `${task.size}人${task.name}（${task.difficulty === 'hard' ? '困难' : '噩梦'}）`;
        console.log('Comparing dungeon task:', taskDisplayName, 'with:', taskName);
        if (taskDisplayName === taskName) {
          console.log('Found matching dungeon task');
          task.selected = true;
        }
      } else {
        // 对于其他任务，直接匹配名称
        console.log('Comparing task:', task.name, 'with:', taskName);
        if (task.name === taskName) {
          console.log('Found matching task');
          task.selected = true;
        }
      }
    });
  });
};

// 监听initialTaskName的变化
watch(() => props.initialTaskName, (newValue) => {
  console.log('initialTaskName changed:', newValue);
  console.log('isEdit:', props.isEdit);
  if (newValue && props.isEdit) {
    console.log('Setting selected tasks for:', newValue);
    setSelectedTasks(newValue);
  }
}, { immediate: true });

// 组件挂载时设置选中状态
onMounted(() => {
  console.log('TaskForm mounted');
  console.log('initialTaskName:', props.initialTaskName);
  console.log('isEdit:', props.isEdit);
  if (props.initialTaskName && props.isEdit) {
    console.log('Setting selected tasks on mount');
    setSelectedTasks(props.initialTaskName);
  }
});

const handleAddSelectedTasks = () => {
  const selectedTasks: Task[] = [];
  Object.entries(props.predefinedTasks).forEach(([category, tasks]) => {
    tasks.forEach(task => {
      if (task.selected) {
        selectedTasks.push({
          ...task,
          category,
          taskKey: category === 'dungeon' 
            ? `${category}-${task.name}-${task.size}-${task.difficulty}`
            : `${category}-${task.name}`
        });
      }
    });
  });
  emit('addSelectedTasks', selectedTasks);
};

const handleAddCustomTask = () => {
  if (customTaskName.value.trim()) {
    emit('addCustomTask', customTaskName.value.trim());
    customTaskName.value = '';
  }
};

// 添加副本任务排序计算属性
const sortedDungeonTasks = computed(() => {
  return [...props.predefinedTasks.dungeon].sort((a, b) => {
    // 1. 首先按人数排序（从小到大）
    const aSize = a.size || 0;
    const bSize = b.size || 0;
    if (aSize !== bSize) {
      return aSize - bSize;
    }
    
    // 2. 人数相同时，按难度排序（困难在前，噩梦在后）
    if (a.difficulty !== b.difficulty) {
      return a.difficulty === 'hard' ? -1 : 1;
    }
    
    // 3. 难度相同时，按名称排序
    return a.name.localeCompare(b.name);
  });
});

// 添加全选处理方法
const handleSelectAllDungeon = () => {
  const isAllSelected = props.predefinedTasks.dungeon.every(task => task.selected);
  props.predefinedTasks.dungeon.forEach(task => {
    task.selected = !isAllSelected;
  });
};

const handleSelectAllGuild = () => {
  const isAllSelected = props.predefinedTasks.guild.every(task => task.selected);
  props.predefinedTasks.guild.forEach(task => {
    task.selected = !isAllSelected;
  });
};

const handleSelectAllWorld = () => {
  const isAllSelected = props.predefinedTasks.world.every(task => task.selected);
  props.predefinedTasks.world.forEach(task => {
    task.selected = !isAllSelected;
  });
};

const handleSelectAllOther = () => {
  const isAllSelected = props.predefinedTasks.other.every(task => task.selected);
  props.predefinedTasks.other.forEach(task => {
    task.selected = !isAllSelected;
  });
};

const handleSelectAllVitality = () => {
  const isAllSelected = props.predefinedTasks.vitality.every(task => task.selected);
  props.predefinedTasks.vitality.forEach(task => {
    task.selected = !isAllSelected;
  });
};

const handleSelectAllActivity = () => {
  const isAllSelected = props.predefinedTasks.activity.every(task => task.selected);
  props.predefinedTasks.activity.forEach(task => {
    task.selected = !isAllSelected;
  });
};

// 添加全选状态
const dungeonAllSelected = computed(() => props.predefinedTasks.dungeon.every(task => task.selected));
const guildAllSelected = computed(() => props.predefinedTasks.guild.every(task => task.selected));
const worldAllSelected = computed(() => props.predefinedTasks.world.every(task => task.selected));
const otherAllSelected = computed(() => props.predefinedTasks.other.every(task => task.selected));
const vitalityAllSelected = computed(() => props.predefinedTasks.vitality.every(task => task.selected));
const activityAllSelected = computed(() => props.predefinedTasks.activity.every(task => task.selected));
</script>

<style scoped>
.task-form-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.task-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* 自定义滚动条样式 */
.task-form-content::-webkit-scrollbar,
.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-form-content::-webkit-scrollbar-track,
.task-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-form-content::-webkit-scrollbar-thumb,
.task-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.task-form-content::-webkit-scrollbar-thumb:hover,
.task-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.task-section {
  background: #fff;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.task-categories {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.task-category {
  flex: 1;
  background: #fcfcfc;
  border-radius: 2px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 260px;
}

.task-category h4 {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  flex-shrink: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding: 1rem 0;
}

.custom-task-input {
  display: flex;
  gap: 8px;
}

:deep(.ant-checkbox-wrapper) {
  margin-right: 0;
  border-radius: 2px;
  transition: background-color 0.3s;
}

:deep(.ant-checkbox-wrapper:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-checkbox-checked + span) {
  color: #1890ff;
}

:deep(.ant-input) {
  border-radius: 4px;
}

:deep(.ant-btn) {
  border-radius: 4px;
}

.custom-section {
  margin-top: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.custom-section .task-category {
  width: 100%;
  min-width: 100%;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.category-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}
</style>