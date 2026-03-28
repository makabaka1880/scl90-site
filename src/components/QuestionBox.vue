<template>
    <div class="scl90-question" @click.self="$emit('click')">
        <p class="prompt">{{ idx }}. {{ prompt }}</p>
        <div class="scale">
            <label v-for="n in 5" :key="n - 1" :class="{ selected: modelValue === n - 1 }">
                <input type="radio" :name="`q-${idx}`" :value="n - 1" v-model="modelValue" />
                {{ scaleLabels[n - 1] }}
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    idx: number;
    prompt: string;
}>();

const modelValue = defineModel<number>({ default: -1 });

defineEmits<{
    click: [];
}>();

const scaleLabels = computed(() => [
    t('scale.notAtAll'),
    t('scale.aLittleBit'),
    t('scale.moderately'),
    t('scale.quiteABit'),
    t('scale.extremely')
]);
</script>

<style scoped lang="scss">
@use '../styles/theme.scss' as *;

.scl90-question {
    margin: $space-md 0;
    padding: $space-md;
    padding-bottom: $space-xl;
    border-bottom: 1px solid $color-gray-400;
}

.prompt {
    font-weight: 500;
    margin-bottom: $space-sm;
    color: $text-primary;
}

.scale {
    display: flex;
    gap: $space-md;
    flex-wrap: wrap;
}

label {
    display: flex;
    align-items: center;
    gap: $space-xs;
    cursor: pointer;
    padding: $space-xs $space-sm;
    border-radius: $radius-sm;
    transition: background 0.2s;
    color: $text-secondary;

    &.selected {
        background: $color-primary-light;
        color: $color-primary;
    }

    &:hover:not(.selected) {
        background: $color-gray-200;
    }
}

input[type="radio"] {
    cursor: pointer;
}
</style>