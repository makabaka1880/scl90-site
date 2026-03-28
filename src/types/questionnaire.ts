export interface QuestionnaireMetadata {
    name: string;
    full_name: string;
    items: number;
    scale: number[];
    scale_labels: string[];
}

export interface QuestionnaireItem {
    id: number;
    text: string;
}

export interface Dimension {
    key: string;
    items: number[];
}

export interface Questionnaire {
    metadata: QuestionnaireMetadata;
    items: QuestionnaireItem[];
    dimensions: Dimension[];
}
