## Zacetna struktura

```text
frontend/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── App.tsx
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── questionnaire/
│   │   ├── recommendations/
│   │   ├── learning-paths/
│   │   ├── competencies/
│   │   ├── modules/
│   │   └── visualization/
│   │
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── utils/
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

```

## Zamišljena struktura noter vsakega Feature-ja
src/features/questionnaire/
│
├── components/
│   ├── QuestionnaireForm.tsx
│   ├── QuestionCard.tsx
│   └── AnswerOption.tsx
│
├── api/
│   └── questionnaireApi.ts
│
├── hooks/
│   └── useQuestionnaire.ts
│
├── types/
│   └── questionnaireTypes.ts
│
└── utils/
    └── questionnaireUtils.ts