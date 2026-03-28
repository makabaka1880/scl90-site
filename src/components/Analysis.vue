<template>
    <div class="analysis">
        <h2>{{ t('analysis.title') }}</h2>

        <div class="warning-banner">
            <span class="warning-icon">⚠️</span>
            <p class="warning-text">{{ t('analysis.warning') }}</p>
        </div>

        <div class="scores-grid">
            <div v-for="score in dimensionScores" :key="score.key" class="score-card"
                :class="{ elevated: score.average >= 1, high: score.average >= 2 }">
                <div class="score-header">
                    <span class="score-name">{{ t(`dimensions.${score.key}`) }}</span>
                    <span class="score-value" :class="getSeverityClass(score.average)">
                        {{ score.average.toFixed(2) }}
                    </span>
                </div>
                <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${(score.average / 4) * 100}%` }"></div>
                </div>
                <div class="score-details">
                    <span>{{ t('analysis.scoreDetails.answered', { answered: score.answered, total: score.total })
                        }}</span>
                    <span>{{ t('analysis.scoreDetails.sum', { sum: score.sum }) }}</span>
                </div>
            </div>
        </div>

        <div class="summary">
            <h3>{{ t('analysis.gsi') }}</h3>
            <div class="gsi-value" :class="getSeverityClass(gsi)">
                {{ gsi.toFixed(2) }}
            </div>
            <p class="interpretation">
                {{ getInterpretation(gsi) }}
            </p>
        </div>

        <div class="legend">
            <h4>{{ t('analysis.legend.title') }}</h4>
            <div class="legend-items">
                <span class="legend-item normal">{{ t('analysis.legend.normal') }}</span>
                <span class="legend-item elevated">{{ t('analysis.legend.elevated') }}</span>
                <span class="legend-item high">{{ t('analysis.legend.high') }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Dimension } from '../types/questionnaire';

const { t } = useI18n();

const props = defineProps<{
    dims: Dimension[];
    answers: number[];
}>();

interface DimensionScore {
    key: string;
    sum: number;
    average: number;
    answered: number;
    total: number;
}

const dimensionScores = computed((): DimensionScore[] => {
    return props.dims.map(dim => {
        let sum = 0;
        let answered = 0;

        for (const idx of dim.items) {
            const answer = props.answers[idx - 1];
            if (answer !== undefined && answer >= 0) {
                sum += answer;
                answered++;
            }
        }

        const total = dim.items.length;
        const average = total > 0 ? sum / total : 0;

        return {
            key: dim.key,
            sum,
            average,
            answered,
            total
        };
    });
});

const gsi = computed(() => {
    const totalSum = dimensionScores.value.reduce((acc, s) => acc + s.sum, 0);
    const totalItems = props.dims.reduce((acc, d) => acc + d.items.length, 0);
    return totalItems > 0 ? totalSum / totalItems : 0;
});

const getSeverityClass = (score: number): string => {
    if (score >= 2) return 'high';
    if (score >= 1) return 'elevated';
    return 'normal';
};

const getInterpretation = (score: number): string => {
    if (score >= 2) {
        return t('analysis.interpretation.high');
    }
    if (score >= 1) {
        return t('analysis.interpretation.elevated');
    }
    return t('analysis.interpretation.normal');
};
</script>

<style scoped lang="scss">
@use '../styles/theme.scss' as *;

.analysis {
    max-width: 800px;
    margin: 0 auto;
    padding: $space-xl;
}

.warning-banner {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 1px solid #ffc107;
    border-radius: $radius-md;
    padding: $space-md $space-lg;
    margin-bottom: $space-xl;
    display: flex;
    align-items: flex-start;
    gap: $space-sm;
}

.warning-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 2px;
}

.warning-text {
    margin: 0;
    color: #856404;
    font-size: 0.9rem;
    line-height: 1.5;
}

h2 {
    text-align: center;
    margin-bottom: $space-xl;
    color: $text-primary;
}

.scores-grid {
    display: grid;
    gap: $space-md;
    margin-bottom: $space-xl;
}

.score-card {
    background: $color-normal-bg;
    border-radius: $radius-md;
    padding: $space-md;
    border-left: 4px solid $color-normal;
    transition: all 0.3s ease;

    &.elevated {
        border-left-color: $color-elevated;
        background: $color-elevated-bg;
    }

    &.high {
        border-left-color: $color-high;
        background: $color-high-bg;
    }
}

.score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-sm;
}

.score-name {
    font-weight: 600;
    color: $text-primary;
}

.score-value {
    font-size: 1.25rem;
    font-weight: 700;

    &.normal {
        color: $color-normal;
    }

    &.elevated {
        color: $color-elevated;
    }

    &.high {
        color: $color-high;
    }
}

.score-bar {
    height: 8px;
    background: $color-gray-300;
    border-radius: $radius-sm;
    overflow: hidden;
    margin-bottom: $space-sm;
}

.score-fill {
    height: 100%;
    background: $gradient-normal;
    transition: width 0.5s ease;

    .score-card.elevated & {
        background: $gradient-elevated;
    }

    .score-card.high & {
        background: $gradient-high;
    }
}

.score-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: $text-secondary;
}

.summary {
    background: $color-primary-light;
    border-radius: $radius-lg;
    padding: $space-xl;
    text-align: center;
    margin-bottom: $space-xl;

    h3 {
        margin-top: 0;
        color: $color-primary;
    }
}

.gsi-value {
    font-size: 3rem;
    font-weight: 700;
    margin: $space-md 0;

    &.normal {
        color: $color-normal;
    }

    &.elevated {
        color: $color-elevated;
    }

    &.high {
        color: $color-high;
    }
}

.interpretation {
    color: $color-gray-700;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
}

.legend {
    background: $color-gray-100;
    border-radius: $radius-md;
    padding: $space-lg;

    h4 {
        margin-top: 0;
        color: $text-secondary;
    }
}

.legend-items {
    display: flex;
    gap: $space-md;
    flex-wrap: wrap;
}

.legend-item {
    padding: $space-xs $space-sm;
    border-radius: $radius-sm;
    font-size: 0.875rem;

    &.normal {
        background: $color-normal-light;
        color: $text-normal;
    }

    &.elevated {
        background: $color-elevated-light;
        color: $text-elevated;
    }

    &.high {
        background: $color-high-light;
        color: $text-high;
    }
}
</style>
