import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import type { Questionnaire } from '../types/questionnaire';
import scl90Data from '../questionare.json' with { type: 'json' };
import questionTranslations from '../locales/questions.json' with { type: 'json' };
import { i18n } from '../i18n';

const STORAGE_KEY = 'scl90-answers';

export const useQuestionnaireStore = defineStore('questionnaire', () => {
  const data = scl90Data as Questionnaire;

  // Initialize answers from localStorage or create new array
  const loadAnswers = (): number[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === data.metadata.items) {
          return parsed;
        }
      } catch {
        // Invalid stored data, fall through to default
      }
    }
    return new Array(data.metadata.items).fill(-1);
  };

  const answers = ref<number[]>(loadAnswers());

  // Persist to localStorage whenever answers change
  watch(
    answers,
    (newAnswers) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
    },
    { deep: true }
  );

  // Get localized items
  const localizedItems = computed(() => {
    const locale = i18n.global.locale.value;
    const translations = questionTranslations[locale as keyof typeof questionTranslations];
    
    return data.items.map((item, index) => ({
      ...item,
      text: translations?.[index] ?? item.text
    }));
  });

  // Computed
  const allAnswered = computed(() => answers.value.every(a => a >= 0));
  const answeredCount = computed(() => answers.value.filter(a => a >= 0).length);
  const progress = computed(() => ({
    answered: answeredCount.value,
    total: data.metadata.items,
    percentage: Math.round((answeredCount.value / data.metadata.items) * 100)
  }));

  // Actions
  const setAnswer = (index: number, value: number) => {
    answers.value[index] = value;
  };

  const reset = () => {
    answers.value = new Array(data.metadata.items).fill(-1);
  };

  const calculateScores = (): Record<string, number> => {
    const scores: Record<string, number> = {};

    for (const dim of data.dimensions) {
      const sum = dim.items.reduce((acc, idx) => {
        // idx is 1-based in JSON, convert to 0-based for answers array
        return acc + (answers.value[idx - 1] >= 0 ? answers.value[idx - 1] : 0);
      }, 0);
      scores[dim.key] = sum / dim.items.length;
    }

    return scores;
  };

  return {
    data,
    localizedItems,
    answers,
    allAnswered,
    answeredCount,
    progress,
    setAnswer,
    reset,
    calculateScores
  };
});