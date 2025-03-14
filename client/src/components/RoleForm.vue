<template>
  <a-form :model="roleForm">
      <div class="role-form-container">
        <div class="role-form-left">
          <a-form-item label="角色名称">
            <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
          </a-form-item>
          <a-form-item label="角色职业">
            <div class="profession-tags">
              <a-tag
                v-for="prof in professions"
                :key="prof.value"
                :style="roleForm.profession === prof.value ? 
                  { backgroundColor: prof.color, borderColor: prof.color } : 
                  { backgroundColor: prof.lightColor, borderColor: prof.color, color: prof.color }"
                class="profession-tag"
                :class="{ 'profession-tag-selected': roleForm.profession === prof.value }"
                @click="roleForm.profession = prof.value"
              >
                {{ prof.value }}
              </a-tag>
            </div>
          </a-form-item>
        </div>
        <div class="role-form-right">
          <a-form-item label="角色描述">
            <a-textarea
              v-model:value="roleForm.description"
              placeholder="请输入角色描述"
              :rows="4"
              :style="{ resize: 'none' }"
            />
          </a-form-item>
        </div>
      </div>
      <div class="form-buttons" v-if="!hideButtons">
        <a-button type="primary" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '保存角色' }}
        </a-button>
      </div>
    </a-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Role {
  id?: number;
  name: string;
  description: string;
  profession: string;
  silver: number;
  tasks?: any[];
}

const props = defineProps<{
  isEdit?: boolean;
  initialRole?: Role;
  hideButtons?: boolean;
}>();

const emit = defineEmits<{
  'submit': [role: Role],
  'cancel': []
}>();

const professions = [
  { value: "鬼王", label: "鬼王", color: "#ff4d4f", hoverColor: "#ff7875", lightColor: "#fff1f0" },
  { value: "灵汐", label: "灵汐", color: "#52c41a", hoverColor: "#73d13d", lightColor: "#f6ffed" },
  { value: "青云", label: "青云", color: "#1890ff", hoverColor: "#40a9ff", lightColor: "#e6f7ff" },
  { value: "焚香", label: "焚香", color: "#fa8c16", hoverColor: "#ffa940", lightColor: "#fff7e6" },
  { value: "合欢", label: "合欢", color: "#722ed1", hoverColor: "#9254de", lightColor: "#f9f0ff" },
];

const roleForm = ref<Role>({
  name: '',
  description: '',
  profession: '',
  silver: 0
});

// 监听初始值变化
watch(() => props.initialRole, (newValue) => {
  if (newValue) {
    roleForm.value = { ...newValue };
  }
}, { immediate: true, deep: true });

const handleSubmit = () => {
  if (!roleForm.value.name.trim()) {
    alert('角色名称不能为空');
    return;
  }
  emit('submit', roleForm.value);
};
</script>

<style scoped>
.role-form-card {
  margin-bottom: 0;
}

.role-form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

.role-form-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-form-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.profession-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 0;
}

.profession-tag {
  position: relative;
  top: 0;
  left: 0;
}

.profession-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profession-tag-selected {
  color: white !important;
}

.profession-tag-selected:hover {
  opacity: 0.85;
}

.profession-tag:active {
  transform: translateY(0);
  box-shadow: none;
}
</style> 