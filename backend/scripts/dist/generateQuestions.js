"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const QUESTIONS_PER_LEVEL = 100;
const DIFFICULTY_SETTINGS = {
    'A1': { difficulty: 'easy', points: 20, time: 40, multiplier: 1.2 },
    'A2': { difficulty: 'easy', points: 20, time: 40, multiplier: 1.2 },
    'B1': { difficulty: 'medium', points: 25, time: 45, multiplier: 1.4 },
    'B2': { difficulty: 'medium', points: 25, time: 45, multiplier: 1.4 },
    'C1': { difficulty: 'hard', points: 30, time: 50, multiplier: 1.6 },
    'C2': { difficulty: 'hard', points: 30, time: 50, multiplier: 1.8 }
};
const IDIOMS = {
    'A1': [
        { idiom: 'Hit the books', meaning: 'Study hard', category: 'education' },
        { idiom: 'Piece of cake', meaning: 'Very easy', category: 'food' },
        { idiom: 'Break a leg', meaning: 'Good luck', category: 'theater' },
        { idiom: 'Call it a day', meaning: 'Stop working', category: 'work' },
        { idiom: 'Hit the road', meaning: 'Start a journey', category: 'travel' }
    ],
    'A2': [
        { idiom: 'Spill the beans', meaning: 'Reveal a secret', category: 'secrets' },
        { idiom: 'Pull someone\'s leg', meaning: 'Tell a joke', category: 'humor' },
        { idiom: 'Cost an arm and a leg', meaning: 'Be very expensive', category: 'money' },
        { idiom: 'Hit the nail on the head', meaning: 'Be exactly right', category: 'accuracy' },
        { idiom: 'Let the cat out of the bag', meaning: 'Reveal a secret', category: 'secrets' }
    ],
    'B1': [
        { idiom: 'A blessing in disguise', meaning: 'Something good that seemed bad', category: 'luck' },
        { idiom: 'A dime a dozen', meaning: 'Very common', category: 'frequency' },
        { idiom: 'Beat around the bush', meaning: 'Avoid the main topic', category: 'communication' },
        { idiom: 'Better late than never', meaning: 'Better to do something late than not at all', category: 'timing' },
        { idiom: 'Bite off more than you can chew', meaning: 'Take on too much', category: 'responsibility' }
    ],
    'B2': [
        { idiom: 'A picture is worth a thousand words', meaning: 'Visuals are more effective than words', category: 'communication' },
        { idiom: 'Actions speak louder than words', meaning: 'What you do is more important than what you say', category: 'behavior' },
        { idiom: 'Add insult to injury', meaning: 'Make a bad situation worse', category: 'problems' },
        { idiom: 'At the drop of a hat', meaning: 'Immediately', category: 'timing' },
        { idiom: 'Back to the wall', meaning: 'In a difficult situation', category: 'problems' }
    ],
    'C1': [
        { idiom: 'A leopard can\'t change its spots', meaning: 'People can\'t change their nature', category: 'character' },
        { idiom: 'A storm in a teacup', meaning: 'A lot of fuss about nothing', category: 'exaggeration' },
        { idiom: 'An arm and a leg', meaning: 'Very expensive', category: 'money' },
        { idiom: 'At the eleventh hour', meaning: 'At the last possible moment', category: 'timing' },
        { idiom: 'Bite the hand that feeds you', meaning: 'Hurt someone who helps you', category: 'betrayal' }
    ],
    'C2': [
        { idiom: 'A bird in the hand is worth two in the bush', meaning: 'What you have is better than what you might get', category: 'wisdom' },
        { idiom: 'A penny for your thoughts', meaning: 'Tell me what you\'re thinking', category: 'communication' },
        { idiom: 'A stitch in time saves nine', meaning: 'Fixing a problem early prevents bigger problems', category: 'wisdom' },
        { idiom: 'All that glitters is not gold', meaning: 'Things aren\'t always as good as they seem', category: 'wisdom' },
        { idiom: 'Barking up the wrong tree', meaning: 'Looking in the wrong place', category: 'mistakes' }
    ]
};
function generateWrongAnswers(meaning, level) {
    const wrongAnswers = [
        'Be very difficult',
        'Be very easy',
        'Be very expensive',
        'Be very cheap',
        'Be very fast',
        'Be very slow',
        'Be very good',
        'Be very bad',
        'Be very happy',
        'Be very sad'
    ];
    // Filter out the correct answer and get 3 random wrong answers
    return wrongAnswers
        .filter(answer => answer !== meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
}
function generateIdiomQuestions(level) {
    const questions = [];
    const levelIdioms = IDIOMS[level] || [];
    const settings = DIFFICULTY_SETTINGS[level];
    for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
        const idiom = levelIdioms[i % levelIdioms.length];
        const wrongAnswers = generateWrongAnswers(idiom.meaning, level);
        const allAnswers = [idiom.meaning, ...wrongAnswers].sort(() => Math.random() - 0.5);
        const correctIndex = allAnswers.indexOf(idiom.meaning);
        questions.push({
            content: {
                idiom: idiom.idiom,
                sentence: `Example sentence using "${idiom.idiom}"`,
                options: allAnswers,
                correct: correctIndex,
                explanation: `The idiom "${idiom.idiom}" means ${idiom.meaning}`,
                tips: [
                    `This idiom is related to ${idiom.category}`,
                    'It\'s commonly used in everyday conversation',
                    'It\'s important to understand the context'
                ]
            },
            metadata: {
                englishLevel: level,
                difficulty: settings.difficulty,
                category: 'idioms',
                subCategory: idiom.category,
                tags: ['idioms', idiom.category, level.toLowerCase()],
                type: 'idiom-challenge'
            },
            gameMetadata: {
                pointsValue: settings.points,
                timeLimit: settings.time,
                difficultyMultiplier: settings.multiplier
            }
        });
    }
    return questions;
}
function generateMultipleChoiceQuestions(level) {
    // Similar structure to generateIdiomQuestions but for multiple choice
    return [];
}
function generateFillInBlanksQuestions(level) {
    // Similar structure to generateIdiomQuestions but for fill in blanks
    return [];
}
function generateSentenceBuilderQuestions(level) {
    // Similar structure to generateIdiomQuestions but for sentence builder
    return [];
}
function generateAllQuestions() {
    const questionTypes = {
        'idiom_challenge.json': generateIdiomQuestions,
        'multiple_choice.json': generateMultipleChoiceQuestions,
        'fill_in_blanks.json': generateFillInBlanksQuestions,
        'sentence_builder.json': generateSentenceBuilderQuestions
    };
    for (const [filename, generator] of Object.entries(questionTypes)) {
        const allQuestions = [];
        for (const level of ENGLISH_LEVELS) {
            const questions = generator(level);
            allQuestions.push(...questions);
        }
        const filePath = path_1.default.join(__dirname, filename);
        fs_1.default.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2));
        console.log(`Generated ${allQuestions.length} questions for ${filename}`);
    }
}
generateAllQuestions();
