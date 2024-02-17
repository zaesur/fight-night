/**
 * @exports
 * @typedef {{ id: number, question: str, answers: str[] }} Question
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
    },
    {
      "id": 2,
      "question": "How do you identify?",
      "answers": ["F", "M", "X"],
    },
    {
      "id": 3,
      "question": "What is your age?",
      "answers": ["-18", "18-24", "25-44", "45-60", "60+"],
    },
    {
      "id": 4,
      "question": "What is your income?",
      "answers": ["-1000", "1000-2500", "2500-4000", "4000-5500", "+5500"],
    },
    {
      "id": 5,
      "question": "Who do you like most?",
      "answers": [1, 2, 3, 4, 5],
    },
    {
      "id": 6,
      "question": "",
      "answers": ["Aurélie", "Eva", "Julia", "Jonas", "Prince"],
    },
    {
      "id": 7,
      "question": "What quality do you value most?",
      "answers": ["Freedom", "Charisma", "Wisdom", "Honesty", "Fun"],
    },
    {
      "id": 8,
      "question": "Are you religious?",
      "answers": ["Religious", "Spiritual", "Neither"],
    },
    {
      "id": 9,
      "question": "A leader should ... me",
      "answers": ["Empower", "Protect", "Respect", "Surprise", "Lead"],
    },
    {
      "id": 10,
      "question": "Are you racist, sexist or violent?",
      "answers": ["Racist", "Sexist", "Violent", "None"],
      //In het script staat 'a little bit...', met nick checken wat op scherm.
    },
    {
      "id": 11,
      "question": "Do you trust the majority of the audience?",
      "answers": ["Yes", "No"],
    },
    {
      "id": 12,
      "question": "How fair is the system?",
      "answers": ["Totally unfair", "Little unfair", "Neutral", "Almost fair", "Totally fair"],
    },
    {
      "id": 13,
      "question": "Who is winning?",
      "answers": ["Aurélie", "Eva", "Julia"],
    },
    {
      "id": 14,
      "question": "Who is winning with host?",
      "answers": ["Aurélie", "Eva", "Julia", "Angelo"],
    },
    {
      "id": 15,
      "question": "Who is winning novote",
      "answers": ["NAME AGREE", "NAME DISAGREE", undefined, undefined, "NAME NOVOTE"],
      //agree is 1, disagree is 2, novote is 5
    },
    {
      "id": 16,
      "question": "who is winning two choices?",
      "answers": ["NAME AGREE", "NAME DISAGREE"],
    },
    {
      "id": 17,
      "question": "Last voting question?",
      "answers": ["NAME AGREE"],
    },
    {
      "id": 18,
      "question": "Do you want the others to leave or stay?",
      "answers": ["Leave", "Stay", undefined],
      //Here we need to know the ID's of the voting devices that were neither collected, nor voted 1, nor voted 2. So all devices in audience that refused to vote.
      //In script it should say that actors backstage press 3 on all collected devices
    },

    //We need 2 more displays on the screen:

    //Display ID's of all uncollected devices not voting in Q18
    //and
    //Display majority sentence
  ],
});
