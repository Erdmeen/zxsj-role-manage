<template>
  <a-card class="role-list-card">
    <template #title>角色列表</template>
    <div class="role-list-container">
      <template v-if="roles.length > 0">
        <div class="silver-summary">
          <a-statistic title="总资产" :value="calculateTotalSilver" suffix="万两">
            <template #prefix>
              <span class="silver-icon">💰</span>
            </template>
          </a-statistic>
        </div>
        <div class="role-list">
          <div
            v-for="(role, index) in roles"
            :key="role.id"
            class="role-item"
            :class="{ active: currentRoleIndex === index }"
            @click="$emit('select', index)"
          >
            <div class="role-content">
              <div class="role-name-container">
                <a-typography-title :level="4" style="margin: 0">
                  {{ role.name }}
                </a-typography-title>
                <a-tag 
                  v-if="role.profession" 
                  class="profession-tag"
                  :style="{
                    backgroundColor: getProfessionColor(role.profession).color,
                    borderColor: getProfessionColor(role.profession).color
                  }"
                >
                  {{ role.profession }}
                </a-tag>
              </div>
              <div v-if="role.silver > 0" class="silver-display">
                <div class="silver-display-content">
                  <span class="silver-icon">💰</span>
                  <div class="silver-amount-container">
                    <span class="silver-amount">{{ role.silver }}</span>
                    <span class="silver-unit">万两</span>
                  </div>
                </div>
              </div>
              <a-progress
                :percent="calculateProgress(role)"
                :status="calculateProgress(role) === 100 ? 'success' : 'active'"
                size="small"
              />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <a-empty description="暂无角色" />
      </template>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Role {
  id: number;
  name: string;
  profession: string;
  silver: number;
  tasks: any[];
}

const props = defineProps<{
  roles: Role[];
  currentRoleIndex: number;
}>();

defineEmits<{
  'select': [index: number]
}>();

const calculateTotalSilver = computed(() => {
  return props.roles.reduce(
    (total: number, role: Role) => total + (role.silver || 0),
    0
  );
});

const calculateProgress = (role: Role) => {
  if (!role || !role.tasks || role.tasks.length === 0) {
    return 0;
  }
  const completedTasks = role.tasks.filter((task) => task.completed).length;
  return Math.round((completedTasks / role.tasks.length) * 100);
};

const professions = [
  { value: "鬼王", label: "鬼王", color: "#ff4d4f", hoverColor: "#ff7875", lightColor: "#fff1f0" },
  { value: "灵汐", label: "灵汐", color: "#52c41a", hoverColor: "#73d13d", lightColor: "#f6ffed" },
  { value: "青云", label: "青云", color: "#1890ff", hoverColor: "#40a9ff", lightColor: "#e6f7ff" },
  { value: "焚香", label: "焚香", color: "#fa8c16", hoverColor: "#ffa940", lightColor: "#fff7e6" },
  { value: "合欢", label: "合欢", color: "#722ed1", hoverColor: "#9254de", lightColor: "#f9f0ff" },
];

const getProfessionColor = (profession: string) => {
  const found = professions.find((p) => p.value === profession);
  return found ? { color: found.color, hoverColor: found.hoverColor, lightColor: found.lightColor } : { color: "", hoverColor: "", lightColor: "" };
};
</script>

<style scoped>
.role-list-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.role-list-card :deep(.ant-card-body) {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.role-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.silver-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.silver-icon-section {
  flex-shrink: 0;
}

.silver-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #e6f7ff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.silver-icon {
  font-size: 24px;
}

.silver-info-section {
  flex: 1;
}

.silver-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.silver-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #262626;
  line-height: 1;
}

.amount-unit {
  font-size: 14px;
  color: #8c8c8c;
}

.role-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  height: 0;
}

.role-item {
  /* padding: 8px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s; */
  background: white;
  /* flex-shrink: 0; */
}

.role-item:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.role-item.active {
  border-color: #1890ff;
  background-color: #e6f4ff;
}

.role-content {
  width: 100%;
}

.role-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.role-name-container :deep(.ant-typography) {
  font-size: 16px;
  line-height: 1.2;
}

.silver-display {
  margin-bottom: 4px;
  overflow: hidden;
}

.silver-display-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 12px;
  width: 100%;
  overflow: hidden;
}

.silver-icon {
  flex-shrink: 0;
  font-size: 12px;
}
.silver-amount-container{
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.silver-amount {
  font-weight: 500;
  color: #1890ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.silver-unit {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

/* 自定义滚动条样式 */
.role-list::-webkit-scrollbar {
  width: 6px;
}

.role-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.role-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.role-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style> 