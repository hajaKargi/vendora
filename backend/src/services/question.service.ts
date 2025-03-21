import { PrismaClient, Status, Question, QuestionType } from "@prisma/client";
import { InternalError, BadRequestError } from "../core/api/ApiError";

const prisma = new PrismaClient();

interface IQuestionCreate {
    type: QuestionType;
    content: {
        question: string;
        correctAnswer: string;
        wrongAnswers: string[];
        explanation: string;
    };
    metadata: {
        englishLevel: string;
        difficulty: string;
        category: string;
        subCategory: string;
        tags: string[];
    };
    gameMetadata: {
        pointsValue: number;
        timeLimit: number;
        difficultyMultiplier: number;
    };
    createdBy: string;
}

interface IQuestionUpdate extends Partial<IQuestionCreate> {
    id: string;
}

class QuestionService {
    public static async createQuestion(data: IQuestionCreate): Promise<Question> {
        try {
            return await prisma.$transaction(async (tx) => {
                const question = await tx.question.create({
                    data: {
                        ...data,
                        status: Status.ACTIVE,
                    },
                });
                return question;
            });
        } catch (error) {
            console.error("Question creation error:", error);
            throw new InternalError("Failed to create question");
        }
    }

    public static async getQuestions(type?: QuestionType): Promise<Question[]> {
        try {
            return await prisma.question.findMany({
                where: {
                    status: Status.ACTIVE,
                    ...(type && { type }),
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } catch (error) {
            console.error("Error fetching questions:", error);
            throw new InternalError("Failed to fetch questions");
        }
    }

    public static async getQuestionById(id: string): Promise<Question | null> {
        try {
            const question = await prisma.question.findFirst({
                where: {
                    id,
                    status: Status.ACTIVE,
                },
            });

            if (!question) {
                throw new BadRequestError("Question not found");
            }

            return question;
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            console.error("Error fetching question:", error);
            throw new InternalError("Failed to fetch question");
        }
    }

    public static async updateQuestion(data: IQuestionUpdate): Promise<Question> {
        const { id, ...updateData } = data;

        try {
            return await prisma.$transaction(async (tx) => {
                const question = await tx.question.update({
                    where: { id },
                    data: updateData,
                });
                return question;
            });
        } catch (error) {
            console.error("Question update error:", error);
            throw new InternalError("Failed to update question");
        }
    }

    public static async deleteQuestion(id: string): Promise<void> {
        try {
            await prisma.question.update({
                where: { id },
                data: { status: Status.INACTIVE },
            });
        } catch (error) {
            console.error("Question deletion error:", error);
            throw new InternalError("Failed to delete question");
        }
    }
}

export default QuestionService; 