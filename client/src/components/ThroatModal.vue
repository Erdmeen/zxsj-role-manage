<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
    showThroatModal: boolean
}>();

const emit = defineEmits(['update:showThroatModal']);

const closeModal = () => {
    emit('update:showThroatModal', false);
}

// 输入数据
const marketPrice = ref<number>(0);
const playerCount = ref<number>(5);

// 计算数据
const taxRate = 0.05; // 5% 交易税
const priceIncreaseRate = 0.1; // 10% 加价率

// 计算结果
const actualValue = computed(() => {
    return Math.floor(marketPrice.value * (1 - taxRate));
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
    return Math.floor(actualValue.value / (playerCount.value - 1 + 1.5));
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
    return Math.floor(actualValue.value / (playerCount.value - 1 + 1.3));
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

const calculateResults = () => {
    if (marketPrice.value <= 0) {
        message.error('请输入商品当前售价');
        return;
    }
    if (playerCount.value <= 1) {
        message.error('请选择竞拍人数');
        return;
    }
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        message.success('复制成功');
    }).catch(() => {
        message.error('复制失败');
    });
};
</script>

<template>
    <a-modal :open="props.showThroatModal" title="锁喉计算" @cancel="closeModal" :width="600">
        <div class="throat-calc">
            <div class="input-section">
                <a-form layout="vertical">
                    <a-form-item label="商品当前售价">
                        <a-input-number
                            v-model:value="marketPrice"
                            :min="0"
                            :step="1000"
                            style="width: 100%"
                            placeholder="请输入商品当前售价"
                        />
                    </a-form-item>
                    <a-form-item label="竞拍人数">
                        <div class="player-count-selector">
                            <div 
                                class="player-count-card" 
                                :class="{ active: playerCount === 5 }"
                                @click="playerCount = 5"
                            >
                                <div class="player-count-number">5</div>
                                <div class="player-count-label">人</div>
                            </div>
                            <div 
                                class="player-count-card" 
                                :class="{ active: playerCount === 10 }"
                                @click="playerCount = 10"
                            >
                                <div class="player-count-number">10</div>
                                <div class="player-count-label">人</div>
                            </div>
                            <div 
                                class="player-count-card" 
                                :class="{ active: playerCount === 20 }"
                                @click="playerCount = 20"
                            >
                                <div class="player-count-number">20</div>
                                <div class="player-count-label">人</div>
                            </div>
                        </div>
                    </a-form-item>
                </a-form>
            </div>

            <a-divider />

            <a-typography v-if="marketPrice > 0">
                <div class="base-calc-card">
                    <a-typography-paragraph>
                        <ul>
                            <li>市场价格：<span class="highlight-price">{{ marketPrice.toLocaleString() }}</span> 银币</li>
                            <li>税后价格：<span class="highlight-price">{{ actualValue.toLocaleString() }}</span> 银币（已扣除{{ taxRate * 100 }}%交易税）</li>
                        </ul>
                    </a-typography-paragraph>
                </div>

                <div class="strategy-comparison">
                    <div class="strategy-card">
                        <a-typography-title :level="5">激进策略（0.5倍）</a-typography-title>
                        <a-typography-paragraph>
                            <ul>
                                <li>最优出价：<span class="highlight-bid copyable" @click="copyToClipboard(aggressiveMinBid.toString())">{{ aggressiveMinBid.toLocaleString() }}</span> 银币</li>
                                <li>最终收益：{{ aggressiveMinBidProfit.toLocaleString() }} 银币</li>
                                <li>团队分成：{{ aggressiveMinBidShare.toLocaleString() }} 银币</li>
                                <li>超额收益：<span class="highlight-profit">{{ aggressiveExtraProfit.toLocaleString() }}</span> 银币</li>
                            </ul>
                        </a-typography-paragraph>
                    </div>
                    <div class="strategy-card">
                        <a-typography-title :level="5">保守策略（0.3倍）</a-typography-title>
                        <a-typography-paragraph>
                            <ul>
                                <li>最优出价：<span class="highlight-bid copyable" @click="copyToClipboard(conservativeMinBid.toString())">{{ conservativeMinBid.toLocaleString() }}</span> 银币</li>
                                <li>最终收益：{{ conservativeMinBidProfit.toLocaleString() }} 银币</li>
                                <li>团队分成：{{ conservativeMinBidShare.toLocaleString() }} 银币</li>
                                <li>超额收益：<span class="highlight-profit">{{ conservativeExtraProfit.toLocaleString() }}</span> 银币</li>
                            </ul>
                        </a-typography-paragraph>
                    </div>
                </div>
            </a-typography>
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
    color: #1890ff;
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
    color: #722ed1;
    font-weight: bold;
}

.player-count-selector {
    display: flex;
    gap: 16px;
    margin-top: 8px;
}

.player-count-card {
    flex: 1;
    padding: 16px;
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
}

.player-count-card:hover {
    border-color: #1890ff;
    background-color: #f0f7ff;
}

.player-count-card.active {
    border-color: #1890ff;
    background-color: #e6f7ff;
}

.player-count-number {
    font-size: 18px;
    font-weight: bold;
    color: #1890ff;
    line-height: 1;
}

.player-count-label {
    font-size: 14px;
    color: #666;
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
</style>