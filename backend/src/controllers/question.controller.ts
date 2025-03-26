import { Request, Response } from 'express';
import { createQuestionValidation, updateQuestionValidation } from '../models/validations/question.validators';
import QuestionService from '../services/question.service';
import { BadRequestError, InternalError } from '../core/api/ApiError';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

class QuestionController {
    public static async createQuestion(req: AuthenticatedRequest, res: Response) {
        try {
            const { error } = createQuestionValidation.body.validate(req.body);
            if (error) {
                throw new BadRequestError(error.details[0].message);
            }

            if (!req.user?.id) {
                throw new BadRequestError('User not authenticated');
            }

            const question = await QuestionService.createQuestion({
                ...req.body,
                createdBy: req.user.id
            });

            res.status(201).json({
                status: 'success',
                data: question
            });
        } catch (error) {
            if (error instanceof BadRequestError) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error'
                });
            }
        }
    }

    public static async updateQuestion(req: Request, res: Response) {
        try {
            const { error } = updateQuestionValidation.body.validate(req.body);
            if (error) {
                throw new BadRequestError(error.details[0].message);
            }

            const question = await QuestionService.updateQuestion({
                id: req.params.id,
                ...req.body
            });

            res.status(200).json({
                status: 'success',
                data: question
            });
        } catch (error) {
            if (error instanceof BadRequestError) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error'
                });
            }
        }
    }

    public static async getQuestionById(req: Request, res: Response) {
        try {
            const question = await QuestionService.getQuestionById(req.params.id);
            if (!question) {
                throw new BadRequestError('Question not found');
            }

            res.status(200).json({
                status: 'success',
                data: question
            });
        } catch (error) {
            if (error instanceof BadRequestError) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error'
                });
            }
        }
    }

    public static async getAllQuestions(req: Request, res: Response) {
        try {
            const { type, category, subCategory, englishLevel, difficulty } = req.query;

            const questions = await QuestionService.getQuestions({
                type: type as any,
                category: category as string,
                subCategory: subCategory as string,
                englishLevel: englishLevel as string,
                difficulty: difficulty as string
            });

            res.status(200).json({
                status: 'success',
                data: questions
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    public static async deleteQuestion(req: Request, res: Response) {
        try {
            await QuestionService.deleteQuestion(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof BadRequestError) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error'
                });
            }
        }
    }
}

export default QuestionController; 