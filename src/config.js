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
export default Object.freeze({
  "apiUrl": "http://localhost:3000",
  // "apiUrl": "https://ontroerend-goed.eventsight.eu/api",
  "questions": [
    {
      "id": 1,
      "question": "Did you pay for your ticket?",
      "options": { 1: "Yes", 2: "No" },
      "activeOptions": 2,
    },
    {
      "id": 2,
      "question": "How do you identify?",
      "options": { 1: "F", 2: "M", 3: "X" },
      "activeOptions": 3,
    },
    {
      "id": 3,
      "question": "What is your age?",
      "options": { 1: "-18", 2: "18-24", 3: "25-44", 4: "45-60", 5: "60+" },
      "activeOptions": 5,
    },
    {
      "id": 4,
      "question": "What is your income?",
      "options": { 1: "-1000", 2: "1000-2500", 3: "2500-4000", 4: "4000-5500", 5: "5500+" },
      "activeOptions": 5,
    },
    {
      "id": 5,
      "question": "Who do you like most?",
      "options": { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
      "activeOptions": 5,
      "isAnimated": true,
      "showOnlyOptionId": true,
    },
    {
      "id": 6,
      "question": "",
      "options": { 1: "Aurélie", 2: "Eva", 3: "Julia", 4: "Jonas", 5: "Prince" },
      "activeOptions": 5,
      "isAnimated": true,
    },
    {
      "id": 7,
      "question": "What quality do you value most?",
      "options": { 1: "Freedom", 2: "Charisma", 3: "Wisdom", 4: "Honesty", 5: "Fun" },
      "activeOptions": 5,
    },
    {
      "id": 8,
      "question": "Are you religious?",
      "options": { 1: "Religious", 2: "Spiritual", 3: "Neither" },
      "activeOptions": 3,
    },
    {
      "id": 9,
      "question": "A leader should ... me",
      "options": { 1: "Empower", 2: "Protect", 3: "Respect", 4: "Surprise", 5: "Lead" },
      "activeOptions": 5,
    },
    {
      "id": 10,
      "question": "Are you racist, sexist or violent?",
      "options": { 1: "Racist", 2: "Sexist", 3: "Violent", 4: "None" },
      "activeOptions": 4,
    },
    {
      "id": 11,
      "question": "Do you trust the majority of the audience?",
      "options": { 1: "Yes", 2: "No" },
      "activeOptions": 2,
    },
    {
      "id": 12,
      "question": "How fair is the system?",
      "options": { 1: "Totally unfair", 2: "Little unfair", 3: "Neutral", 4: "Almost fair", 5: "Totally fair" },
      "activeOptions": 5,
    },
    {
      "id": 13,
      "question": "Who is winning?",
      "options": { 1: "Aurélie", 2: "Eva", 3: "Julia" },
      "activeOptions": 3,
      "isAnimated": true,
      "showQuestion": true,
    },
    {
      "id": 14,
      "question": "Who is winning with host?",
      "options": { 1: "Aurélie", 2: "Eva", 3: "Julia", 4: "Angelo" },
      "isAnimated": true,
      "activeOptions": 4,
    },
    {
      "id": 15,
      "question": "Who is winning novote",
      "options": { 1: "NAME AGREE", 2: "NAME DISAGREE", 5: "NAME NOVOTE" },
      "isAnimated": true,
      "activeOptions": 5,
    },
    {
      "id": 16,
      "question": "who is winning two choices?",
      "options": { 1: "NAME AGREE", 2: "NAME DISAGREE" },
      "isAnimated": true,
      "activeOptions": 2,
    },
    {
      "id": 17,
      "question": "Last voting question?",
      "options": { 1: "NAME AGREE" },
      "isAnimated": true,
      "activeOptions": 1,
    },
    {
      "id": 18,
      "question": "Do you want the others to leave or stay?",
      "options": { 1: "Leave", 2: "Stay" },
      "activeOptions": 5,
    },
  ],
});
