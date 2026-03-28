<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import QuestionBox from './components/QuestionBox.vue';
import Analysis from './components/Analysis.vue';
import { useQuestionnaireStore } from './stores/questionnaire';
import { setLocale } from './i18n';

const { t, locale } = useI18n();
const store = useQuestionnaireStore();
const showAnalysis = ref(false);

const currentIndex = computed(() => {
    const idx = store.answers.findIndex(a => a < 0);
    return idx === -1 ? store.data.metadata.items - 1 : idx;
});

const currentQuestion = computed(() => store.localizedItems[currentIndex.value]);
const isLastQuestion = computed(() => currentIndex.value === store.data.metadata.items - 1);

watch(() => store.answers[currentIndex.value], (newVal, oldVal) => {
    if (newVal! >= 0 && newVal !== oldVal && !isLastQuestion.value) {
        // Small delay to show the selection before advancing
        setTimeout(() => {
            const nextIdx = currentIndex.value + 1;
            // Scroll to next question smoothly
            nextTick(() => {
                const nextEl = document.querySelector(`[data-question="${nextIdx + 1}"]`);
                nextEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }, 200);
    }
});

const submit = () => {
    showAnalysis.value = true;
    setTimeout(() => {
        document.querySelector('.analysis')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

const reset = () => {
    store.reset();
    showAnalysis.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleLocale = () => {
    const newLocale = locale.value === 'en' ? 'zh' : 'en';
    setLocale(newLocale);
};

const goToQuestion = (index: number) => {
    const el = document.querySelector(`[data-question="${index + 1}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
</script>

<template>
    <div class="container">
        <header>
            {{ store.progress.answered }} / {{ store.progress.total }}
            <h1>{{ t('app.title') }}</h1>
            <button class="lang-switch" @click="toggleLocale">
                {{ locale === 'en' ? '中文' : 'English' }}
            </button>
        </header>
        <div v-if="!showAnalysis" class="question-container">

            <div class="questions">
                <QuestionBox v-for="(item, index) in store.localizedItems" :key="item.id" :data-question="item.id"
                    :idx="item.id" :prompt="item.text" v-model="store.answers[index]" :class="{
                        'current': index === currentIndex,
                        'answered': store.answers[index]! >= 0,
                        'future': index > currentIndex
                    }" @click="goToQuestion(index)" />
            </div>

            <!-- Submit button when all answered -->
            <div v-if="store.allAnswered" class="actions">
                <button @click="submit" class="submit-btn">
                    {{ t('app.viewAnalysis') }}
                </button>
            </div>
        </div>

        <Analysis v-else :dims="store.data.dimensions" :answers="store.answers" />

        <button v-if="showAnalysis" @click="reset" class="reset-btn">
            {{ t('app.startOver') }}
        </button>
    </div>
</template>

<style scoped lang="scss">
@use './styles/theme.scss' as *;
@use './styles/base.scss' as *;

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: $space-xl;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-xl;
    flex-wrap: wrap;
    gap: $space-md;
    position: sticky;
    top: 0;
    background: $color-white;
    padding: $space-md 0;
    z-index: 10;
}

h1 {
    text-align: center;
    color: $text-primary;
    margin: 0 auto;
}

.lang-switch {
    padding: $space-xs $space-sm;
    background: transparent;
    border: 1px solid $color-gray-300;
    border-radius: $radius-sm;
    cursor: pointer;
    color: $text-secondary;
    font-size: 0.875rem;
    transition: all 0.2s;

    &:hover {
        background: $color-gray-200;
        border-color: $color-gray-400;
    }
}

.question-container {
    position: relative;
}

.progress-bar {
    height: 4px;
    background: $color-gray-300;
    border-radius: $radius-sm;
    margin-bottom: $space-sm;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: $color-primary;
    transition: width 0.3s ease;
}

.progress-text {
    text-align: center;
    color: $text-secondary;
    margin-bottom: $space-lg;
    font-size: 0.875rem;
}

.questions> :deep(.scl90-question) {
    transition: all 0.3s ease;
    opacity: 0.6;
    transform: scale(0.98);

    &.answered {
        transform: scale(.98);
        opacity: 0.7;
    }

    &.current {
        opacity: 1;
        transform: scale(1);
        // background: $color-primary-light;
        // border-radius: $radius-md;
        // box-shadow: 2 2px 8px rgba(0, 0, 0, 0.05);
    }


    &.future {
        opacity: 0.3;
    }

    &:hover {
        opacity: 0.9;
    }
}

.actions {
    text-align: center;
    margin: $space-xl 0;
}

.submit-btn {
    padding: $space-sm $space-xl;
    background: $color-primary;
    color: $color-white;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;

    &:hover {
        background: $color-primary-dark;
    }
}

.reset-btn {
    display: block;
    margin: $space-xl auto;
    padding: $space-sm $space-xl;
    background: $color-reset;
    color: $color-white;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;

    &:hover {
        background: $color-reset-dark;
    }
}
</style>
