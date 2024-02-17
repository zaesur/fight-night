/**
 * @exports
 * @typedef {{ id: number, question: str, answers: str[, activeOptions: number] }} Question
 * @typedef {{ apiUrl: str, questions: Question[] }} Config
 * @type { Config }
 */
export default Object.freeze({
  // Could be window.location in production, if served from the same server.
  // "apiUrl": "http://localhost:3000",
  "apiUrl": "https://ontroerend-goed.eventsight.eu/api",
  "questions": [
    {
      "id": 1,
      "question": "Did you pay for your ticket?",
      "answers": ["Yes", "No"],
      "activeOptions": 2,
    },
    {
      "id": 2,
      "question": "How do you identify?",
      "answers": ["F", "M", "X"],
      "activeOptions": 3,
    },
    {
      "id": 3,
      "question": "What is your age?",
      "answers": ["-18", "18-24", "25-44", "45-60", "60+"],
      "activeOptions": 5,
    },
    {
      "id": 4,
      "question": "What is your income?",
      "answers": ["-1000", "1000-2500", "2500-4000", "4000-5500", "+5500"],
      "activeOptions": 5,
    },
    {
      "id": 5,
      "question": "Who do you like most?",
      "answers": ["①", "②", "③", "④", "⑤"],
      "activeOptions": 5,
    },
    {
      "id": 6,
      "question": "",
      "answers": ["Aurélie", "Eva", "Julia", "Jonas", "Prince"],
      "activeOptions": 5,
    },
    {
      "id": 7,
      "question": "What quality do you value most?",
      "answers": ["Freedom", "Charisma", "Wisdom", "Honesty", "Fun"],
      "activeOptions": 5,
    },
    {
      "id": 8,
      "question": "Are you religious?",
      "answers": ["Religious", "Spiritual", "Neither"],
      "activeOptions": 3,
    },
    {
      "id": 9,
      "question": "A leader should ... me",
      "answers": ["Empower", "Protect", "Respect", "Surprise", "Lead"],
      "activeOptions": 5,
    },
    {
      "id": 10,
      "question": "Are you racist, sexist or violent?",
      "answers": ["Racist", "Sexist", "Violent", "None"],
      "activeOptions": 4,
    },
    {
      "id": 11,
      "question": "Do you trust the majority of the audience?",
      "answers": ["Yes", "No"],
      "activeOptions": 2,
    },
    {
      "id": 12,
      "question": "How fair is the system?",
      "answers": ["Totally unfair", "Little unfair", "Neutral", "Almost fair", "Totally fair"],
      "activeOptions": 5,
    },
    {
      "id": 13,
      "question": "Who is winning?",
      "answers": ["Aurélie", "Eva", "Julia"],
      "activeOptions": 3,
    },
    {
      "id": 14,
      "question": "Who is winning with host?",
      "answers": ["Aurélie", "Eva", "Julia", "Angelo"],
      "activeOptions": 4,
    },
    {
      "id": 15,
      "question": "Who is winning novote",
      "answers": ["NAME AGREE", "NAME DISAGREE", undefined, undefined, "NAME NOVOTE"],
      "activeOptions": 5,
    },
    {
      "id": 16,
      "question": "who is winning two choices?",
      "answers": ["NAME AGREE", "NAME DISAGREE"],
      "activeOptions": 2,
    },
    {
      "id": 17,
      "question": "Last voting question?",
      "answers": ["NAME AGREE"],
      "activeOptions": 1,
    },
    {
      "id": 18,
      "question": "Do you want the others to leave or stay?",
      "answers": ["Leave", "Stay"],
      "activeOptions": 5,
    },
  ],
});
