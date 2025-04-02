<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    showThroatModal: boolean
}>();

const emit = defineEmits(['update:showThroatModal']);

const closeModal = () => {
    emit('update:showThroatModal', false);
}

// 输入数据
const marketPrice = ref<number | null>(null);
const selectedOption = ref<number | null>(null);
const playerCount = ref<number>(5);

// 预设商品价格选项
const marketPriceOptions = ref<Array<{ label: string; value: number; updateTime: string }>>([]);

// 编辑状态
const isEditing = ref(false);
const editingItem = ref<{ label: string; value: number; updateTime: string } | null>(null);
const editingIndex = ref<number>(-1);

// 从本地存储加载数据
const loadMarketPriceOptions = () => {
    const saved = localStorage.getItem('marketPriceOptions');
    if (saved) {
        marketPriceOptions.value = JSON.parse(saved);
    } else {
        // 默认数据
        marketPriceOptions.value = [
            { label: '仙辉灵珠袋', value: 500000, updateTime: '04/02 12:00' },
            { label: '万载寒晶匣', value: 250000, updateTime: '04/02 12:00' },
            { label: '寻灵砂礼袋', value: 250000, updateTime: '04/02 12:00' },
            { label: '怨星霜', value: 250000, updateTime: '04/02 12:00' },
        ];
        // 保存默认数据
        saveMarketPriceOptions();
    }
};

// 保存数据到本地存储
const saveMarketPriceOptions = () => {
    localStorage.setItem('marketPriceOptions', JSON.stringify(marketPriceOptions.value));
};

// 开始编辑
const startEdit = (item: { label: string; value: number; updateTime: string }, index: number) => {
    editingItem.value = { ...item };
    isEditing.value = true;
    editingIndex.value = index;
};

// 保存编辑
const saveEdit = () => {
    if (editingItem.value) {
        if (editingIndex.value === marketPriceOptions.value.length) {
            // 新商品
            marketPriceOptions.value.push({
                ...editingItem.value,
                updateTime: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            });
        } else if (editingIndex.value !== -1) {
            // 编辑现有商品
            marketPriceOptions.value[editingIndex.value] = {
                ...editingItem.value,
                updateTime: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            };
        }
        saveMarketPriceOptions();
        message.success('保存成功');
    }
    isEditing.value = false;
    editingItem.value = null;
    editingIndex.value = -1;
};

// 取消编辑
const cancelEdit = () => {
    isEditing.value = false;
    editingItem.value = null;
    editingIndex.value = -1;
};

// 删除选项
const deleteOption = (index: number) => {
    marketPriceOptions.value = marketPriceOptions.value.filter((item, i) => i !== index);
    saveMarketPriceOptions();
};

// 添加新选项
const addNewOption = () => {
    const newItem = {
        label: '新商品',
        value: 0,
        updateTime: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    };
    editingItem.value = newItem;
    editingIndex.value = marketPriceOptions.value.length;
    isEditing.value = true;
};

// 初始化加载数据
loadMarketPriceOptions();

// 计算数据
const taxRate = 0.05; // 5% 交易税
const priceIncreaseRate = 0.1; // 10% 加价率

// 计算结果
const actualValue = computed(() => {
    return marketPrice.value ? Math.floor(marketPrice.value * (1 - taxRate)) : 0;
});

// 基础最低出价
const baseMinBid = computed(() => {
    return Math.floor(actualValue.value / (1 + priceIncreaseRate));
});

// 需要分成金额
const requiredShare = computed(() => {
    return Math.floor(baseMinBid.value / (playerCount.value - 1));
});

// 激进策略（0.5倍）计算
const aggressiveMinBidShare = computed(() => {
    // 设成员分成为x，则我的利润为x * 0.5
    // 总利润 = 税后价格 - 最优出价 = x + x * 0.5 = x * 1.5
    // 最优出价 = 税后价格 - (x * 1.5)
    // 成员分成 = 最优出价 / (人数-1)
    // 所以：x = (税后价格 - (x * 1.5)) / (人数-1)
    // 解得：x = 税后价格 / (人数-1 + 1.5)
    const share = Math.floor(actualValue.value / (playerCount.value - 1 + 1.5));
    return Math.floor(share / 1000) * 1000;
});

const aggressiveMinBid = computed(() => {
    const bid = Math.floor(actualValue.value - (aggressiveMinBidShare.value * 1.5));
    return Math.floor(bid / 1000) * 1000;
});

const aggressiveMinBidProfit = computed(() => {
    return Math.floor(actualValue.value - aggressiveMinBid.value);
});

const aggressiveExtraProfit = computed(() => {
    return Math.floor(aggressiveMinBidShare.value * 0.5);
});

// 保守策略（0.3倍）计算
const conservativeMinBidShare = computed(() => {
    // 设成员分成为x，则我的利润为x * 0.3
    // 总利润 = 税后价格 - 最优出价 = x + x * 0.3 = x * 1.3
    // 最优出价 = 税后价格 - (x * 1.3)
    // 成员分成 = 最优出价 / (人数-1)
    // 所以：x = (税后价格 - (x * 1.3)) / (人数-1)
    // 解得：x = 税后价格 / (人数-1 + 1.3)
    const share = Math.floor(actualValue.value / (playerCount.value - 1 + 1.3));
    return Math.floor(share / 1000) * 1000;
});

const conservativeMinBid = computed(() => {
    const bid = Math.floor(actualValue.value - (conservativeMinBidShare.value * 1.3));
    return Math.floor(bid / 1000) * 1000;
});

const conservativeMinBidProfit = computed(() => {
    return Math.floor(actualValue.value - conservativeMinBid.value);
});

const conservativeExtraProfit = computed(() => {
    return Math.floor(conservativeMinBidShare.value * 0.3);
});

// 加价金额 = 最低出价 × (1 + 加价率)
const nextBid = computed(() => {
    return Math.floor(aggressiveMinBid.value * (1 + priceIncreaseRate));
});

// 加价者利润 = 税后实际价值 - 加价金额
const bidderProfit = computed(() => {
    return Math.floor(actualValue.value - nextBid.value);
});

// 团内成员分成 = 加价金额 ÷ (人数 - 1)
const teamShare = computed(() => {
    return Math.floor(nextBid.value / (playerCount.value - 1));
});

const copyToClipboard = async (text: string) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // 现代浏览器 API
            await navigator.clipboard.writeText(text);
            message.success('复制成功');
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                message.success('复制成功');
            } catch (err) {
                message.error('复制失败');
            }

            textArea.remove();
        }
    } catch (err) {
        message.error('复制失败');
    }
};

// 处理下拉框选择
const handleSelect = (value: number | null) => {
    console.log('handleSelect', value);
    marketPrice.value = value;
    selectedOption.value = value;
};

// 处理输入框值变化
const handleInputChange = (value: number | null) => {
    marketPrice.value = value;
    selectedOption.value = null;
};
</script>

<template>
    <a-modal :open="props.showThroatModal" title="拍卖计算" @cancel="closeModal" :width="600" :footer="false">
        <div class="throat-calc">
            <div class="input-section">
                <a-form layout="inline">
                    <a-form-item label="商品售价">
                        <a-select v-model:value="selectedOption" :options="marketPriceOptions" placeholder="选择预设商品"
                            allowClear @change="handleSelect" style="flex: 2.5">
                            <template #option="option">
                                <div class="select-option">
                                    <span>{{ option.label }}</span>
                                    <span class="option-time">{{ option.updateTime }}</span>
                                </div>
                            </template>
                        </a-select>
                        <a-input-number v-model:value="marketPrice" :min="0" :step="1000"
                            style="flex: 1.5; margin-left: 8px" placeholder="或输入自定义价格" :allow-clear="true"
                            @update:value="handleInputChange" />
                        <a-button type="link" @click="addNewOption" style="margin-left: 8px">
                            <template #icon><plus-outlined /></template>添加预设
                        </a-button>
                    </a-form-item>
                    <a-form-item label="竞拍人数">
                        <div class="player-count-selector">
                            <div class="player-count-card" :class="{ active: playerCount === 5 }"
                                @click="playerCount = 5">
                                <div class="player-count-number">5</div>
                                <div class="player-count-label">人</div>
                            </div>
                            <div class="player-count-card" :class="{ active: playerCount === 10 }"
                                @click="playerCount = 10">
                                <div class="player-count-number">10</div>
                                <div class="player-count-label">人</div>
                            </div>
                            <div class="player-count-card" :class="{ active: playerCount === 20 }"
                                @click="playerCount = 20">
                                <div class="player-count-number">20</div>
                                <div class="player-count-label">人</div>
                            </div>
                        </div>
                    </a-form-item>
                </a-form>
            </div>

            <a-divider v-if="marketPrice > 0" />

            <a-typography v-if="marketPrice > 0">
                <div class="strategy-comparison">
                    <div class="strategy-card">
                        <a-typography-title :level="5">激进策略（赚0.5倍）</a-typography-title>
                        <a-typography-paragraph>
                            <ul>
                                <li>税后价格：<span class="highlight-price">{{ actualValue.toLocaleString() }}</span></li>
                                <li>最优出价：<span class="highlight-bid copyable"
                                        @click="copyToClipboard(aggressiveMinBid.toString())">{{
                                            aggressiveMinBid.toLocaleString()
                                        }}
                                        <CopyOutlined />
                                    </span></li>
                                <li>最终收益：{{ aggressiveMinBidProfit.toLocaleString() }}</li>
                                <li>团队分成：{{ aggressiveMinBidShare.toLocaleString() }}</li>
                                <li>超额收益：<span class="highlight-profit">{{ aggressiveExtraProfit.toLocaleString()
                                }}</span></li>
                            </ul>
                        </a-typography-paragraph>
                    </div>
                    <div class="strategy-card">
                        <a-typography-title :level="5">保守策略（赚0.3倍）</a-typography-title>
                        <a-typography-paragraph>
                            <ul>
                                <li>税后价格：<span class="highlight-price">{{ actualValue.toLocaleString() }}</span></li>
                                <li>最优出价：<span class="highlight-bid copyable"
                                        @click="copyToClipboard(conservativeMinBid.toString())">{{
                                            conservativeMinBid.toLocaleString() }}
                                        <CopyOutlined />
                                    </span>
                                </li>
                                <li>最终收益：{{ conservativeMinBidProfit.toLocaleString() }}</li>
                                <li>团队分成：{{ conservativeMinBidShare.toLocaleString() }}</li>
                                <li>超额收益：<span class="highlight-profit">{{ conservativeExtraProfit.toLocaleString()
                                }}</span>
                                </li>
                            </ul>
                        </a-typography-paragraph>
                    </div>
                </div>
            </a-typography>


            <!-- 编辑商品列表 -->
            <div class="edit-section" v-if="isEditing">
                <a-form :model="editingItem" layout="inline">
                    <a-form-item label="商品名称">
                        <a-input v-model:value="editingItem.label" placeholder="请输入商品名称" />
                    </a-form-item>
                    <a-form-item label="商品价格">
                        <a-input-number v-model:value="editingItem.value" :min="0" :step="1000" style="width: 100%"
                            placeholder="请输入价格" />
                    </a-form-item>
                    <a-form-item>
                        <a-space>
                            <a-button type="primary" @click="saveEdit">保存</a-button>
                            <a-button @click="cancelEdit">取消</a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </div>

            <!-- 商品列表 -->
            <a-divider v-if="marketPriceOptions.length > 0" />

            <div class="options-list" v-if="marketPriceOptions.length > 0">
                <div v-for="(item, index) in marketPriceOptions" :key="item.value" class="option-item">
                    <div class="option-content">
                        <span class="option-label">{{ item.label }}</span>
                        <span class="option-value">{{ item.value.toLocaleString() }}</span>
                        <span class="option-time" style="flex: 1">{{ item.updateTime }}</span>
                    </div>
                    <div class="option-actions">
                        <a-button type="link" @click="startEdit(item, index)">编辑</a-button>
                        <a-button type="link" danger @click="deleteOption(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <a-divider v-if="marketPriceOptions.length > 0" />

            <a-typography-paragraph>
                <a-typography-title :level="5" style="text-align: right">Tips：商品价格需要自己更新</a-typography-title>
            </a-typography-paragraph>

        </div>
    </a-modal>
</template>

<style scoped>
.throat-calc {
    padding: 16px;
}

.input-section {
    margin-bottom: 24px;
}

.strategy-comparison {
    display: flex;
    gap: 24px;
    margin-top: 16px;
}

.strategy-card {
    flex: 1;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background-color: #fafafa;
}

.highlight-bid {
    color: #ff4d4f;
    font-weight: bold;
}

.highlight-profit {
    color: #52c41a;
    font-weight: bold;
}

:deep(.ant-typography-title) {
    margin-top: 0 !important;
    margin-bottom: 16px !important;
}

:deep(.ant-typography-paragraph) {
    margin-bottom: 16px !important;
}

ul {
    margin-bottom: 0;
}

li {
    margin-bottom: 8px;
}

:deep(.ant-input-number) {
    width: 100%;
}

.base-calc-card {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background-color: #fafafa;
    margin-top: 16px;
}

.highlight-price {
    color: #1890ff;
    font-weight: bold;
}

.player-count-selector {
    display: flex;
    gap: 8px;
    width: 100%;
}

.player-count-card {
    flex: 1;
    padding: 3px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
}

.player-count-card:hover {
    border-color: #1890ff;
    background-color: #f0f7ff;
}

.player-count-card.active {
    border-color: #1890ff;
    background-color: #e6f7ff;
    color: #1890ff;
}

.player-count-number {
    font-size: 14px;
    line-height: 1;
}

.player-count-label {
    font-size: 14px;
}

.copyable {
    cursor: pointer;
    position: relative;
}

.copyable:hover::after {
    content: '';
    position: absolute;
    right: -60px;
    top: 0;
    font-size: 12px;
    color: #999;
    font-weight: normal;
}

.ant-form {
    gap: 10px;
}

.ant-form-item {
    width: 100%;
}

:deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
    width: 100%;

    >div {
        flex: 1;
    }
}

.select-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.option-time {
    color: #999;
    font-size: 12px;
}

.edit-section {
    margin: 16px 0;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background-color: #fafafa;
}

.options-list {
    height: 180px;
    overflow-y: auto;
    margin-top: 16px;
}

.option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
}

.option-item:last-child {
    border-bottom: none;
}

.option-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.option-label {
    font-weight: 500;
    min-width: 100px;
    flex: 1.5;
}

.option-value {
    color: #1890ff;
    flex: 1.5;
}

.option-time {
    color: #999;
    font-size: 12px;
}

.option-actions {
    display: flex;
    gap: 8px;
}

:deep(.ant-btn-link) {
    padding: 0;
    height: auto;
}
</style>