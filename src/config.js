/**
 * Config for the application.
 * id: the id of the question.
 * question: the question formulation.
 * options: the option ids along with their labels.
 * activeOptions: the number of option ids to activate.
 * isAnimated: if true, the question results should be animated.
 * showOnlyOptionId: if true, the option labels will be hidden.
 * showQuestion: if true, the question formulation will be shown.
 *
 * @exports
 * @typedef {{
 *  id: number,
 *  question: str,
 *  options: Object.<number, str>,
 *  activeOptions: number,
 *  isAnimated?: true,
 *  showOnlyOptionId?: true,
 *  showQuestion?: true
 * }} Question
 * @typedef {{ apiUrl: str, questions: Question[] }} Config
 * @type { Config }
 */
export default {
  // "apiUrl": "http://localhost:3000",
  "apiUrl": "https://ontroerend-goed.eventsight.eu/api",
  "pollInterval": 4000,
  "returnRemotes": {
    "en": "Please hand in your voting device at the exit.\nThanks!",
    "nl": "Gelieve uw stembakje in te leveren bij het verlaten van de zaal.\nBedankt!",
  },
  "questions": [
    {
      "id": 1,
      "question": { "en": "Did you pay for your ticket?", "nl": "Heb je voor je ticket betaald?" },
      "options": { 1: { "en": "Yes", "nl": "Ja" }, 2: { "en": "No", "nl": "Nee" } },
      "activeOptions": 2,
    },
    {
      "id": 2,
      "question": { "en": "How do you identify?", "nl": "Hoe identificeer je jezelf?" },
      "options": {
        1: "F",
        2: "M",
        3: "X",
      },
      "activeOptions": 3,
    },
    {
      "id": 3,
      "question": { "en": "What is your age?", "nl": "Wat is je leeftijd?" },
      "options": {
        1: "-18",
        2: "18—24",
        3: "25—44",
        4: "45—60",
        5: "60⁺",
      },
      "activeOptions": 5,
    },
    {
      "id": 4,
      "question": { "en": "What is your income?", "nl": "Wat is je inkomen?" },
      "options": {
        1: "-1000",
        2: "1000—2500",
        3: "2500—4000",
        4: "4000—5500",
        5: "+5500",
      },
      "activeOptions": 5,
    },
    {
      "id": 5,
      "question": { "en": "Who do you like most?", "nl": "Wie vind je het leukst?" },
      "options": {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
      },
      "activeOptions": 5,
      "isAnimated": true,
      "showOnlyOptionId": true,
    },
    {
      "id": 6,
      "question": { "en": "Who do you like most?", "nl": "Wie vind je het leukst?" },
      "options": {
        1: "Aurélie",
        2: "Eva",
        3: "Julia",
        4: "Jonas",
        5: "Prince",
      },
      "activeOptions": 5,
      "isAnimated": true,
    },
    {
      "id": 7,
      "question": { "en": "What quality do you value most?", "nl": "Welke kwaliteit waardeer je het meest?" },
      "options": {
        1: { "en": "Freedom", "nl": "Vrijheid" },
        2: { "en": "Charisma", "nl": "Charisma" },
        3: { "en": "Wisdom", "nl": "Wijsheid" },
        4: { "en": "Honesty", "nl": "Eerlijkheid" },
        5: { "en": "Fun", "nl": "Fun" },
      },
      "activeOptions": 5,
    },
    {
      "id": 8,
      "question": { "en": "Are you religious?", "nl": "Ben je religieus?" },
      "options": {
        1: { "en": "Religious", "nl": "Religieus" },
        2: { "en": "Spiritual", "nl": "Spiritueel" },
        3: { "en": "Neither", "nl": "Geen van beide" },
      },
      "activeOptions": 3,
    },
    {
      "id": 9,
      "question": { "en": "A leader should ... me", "nl": "Een goede leider moet mij ..." },
      "options": {
        1: { "en": "Empower", "nl": "Versterken" },
        2: { "en": "Protect", "nl": "Beschermen" },
        3: { "en": "Respect", "nl": "Respecteren" },
        4: { "en": "Surprise", "nl": "Verrassen" },
        5: { "en": "Lead", "nl": "Leiden" },
      },
      "activeOptions": 5,
    },
    {
      "id": 10,
      "question": { "en": "Are you racist, sexist or violent?", "nl": "Ben je racistisch, seksistisch of geweldadig?" },
      "options": {
        1: { "en": "Racist", "nl": "Racistisch" },
        2: { "en": "Sexist", "nl": "Seksistisch" },
        3: { "en": "Violent", "nl": "Geweldadig" },
        4: { "en": "None", "nl": "Geen van deze" },
      },
      "activeOptions": 4,
    },
    {
      "id": 11,
      "question": {
        "en": "Do you trust the majority of the audience?",
        "nl": "Vertrouw je de meerderheid van het publiek?",
      },
      "options": { 1: { "en": "Yes", "nl": "Ja" }, 2: { "en": "No", "nl": "Nee" } },
      "activeOptions": 2,
    },
    {
      "id": 12,
      "question": { "en": "How fair is the system?", "nl": "Hoe eerlijk is het systeem?" },
      "options": {
        1: { "en": "Totally unfair", "nl": "Totaal oneerlijk" },
        2: { "en": "Little unfair", "nl": "Oneerlijk" },
        3: { "en": "Neutral", "nl": "Neutraal" },
        4: { "en": "Almost fair", "nl": "Eerlijk" },
        5: { "en": "Totally fair", "nl": "Totaal eerlijk" },
      },
      "activeOptions": 5,
    },
    {
      "id": 13,
      "question": { "en": "Who is winning?", "nl": "Wie wint er?" },
      "options": {
        1: "Aurélie",
        2: "Eva",
        3: "Julia",
      },
      "activeOptions": 3,
      "isAnimated": true,
      "showQuestion": true,
    },
    {
      "id": 14,
      "question": { "en": "Who is winning (with host)?", "nl": "Wie wint er (met host)" },
      "options": {
        1: "Aurélie",
        2: "Eva",
        3: "Julia",
        4: "Angelo",
      },
      "isAnimated": true,
      "activeOptions": 4,
    },
    {
      "id": 15,
      "question": { "en": "Who is winning (with novote)?", "nl": "Wie wint er (met novote)?" },
      "options": {
        1: { "en": "NAME AGREE", "nl": "NAAM EENS" },
        2: { "en": "NAME DISAGREE", "nl": "NAAM ONEENS" },
        5: { "en": "NAME NOVOTE", "nl": "NAAM NOVOTE" },
      },
      "isAnimated": true,
      "activeOptions": 5,
    },
    {
      "id": 16,
      "question": { "en": "Who is winning (two choices)?", "nl": "Wie wint er (twee keuzes)?" },
      "options": { 1: { "en": "NAME AGREE", "nl": "NAAM EENS" }, 2: { "en": "NAME DISAGREE", "nl": "NAAM ONEENS" } },
      "isAnimated": true,
      "activeOptions": 2,
    },
    {
      "id": 17,
      "question": { "en": "Last voting question?", "nl": "Laatste stemvraag?" },
      "options": { 1: { "en": "NAME AGREE", "nl": "NAAM EENS" } },
      "isAnimated": true,
      "activeOptions": 1,
    },
    {
      "id": 18,
      "question": { "en": "Do you want the others to leave or stay?", "nl": "Wil je dat de rest blijft or gaat?" },
      "options": { 1: { "en": "Leave", "nl": "Gaan" }, 2: { "en": "Stay", "nl": "Blijven" } },
      "activeOptions": 5,
    },
  ],
};
