import { Router } from 'express';
import QuestionController from '../../../controllers/question.controller';
import { isAuthorized } from '../../../middlewares/authentication';
import validateRequest from '../../../middlewares/validator';
import {
    createQuestionValidation,
    updateQuestionValidation,
} from '../../../models/validations/question.validators';

const router = Router();

// Protected routes (require authentication)
// router.use(isAuthorized());

// Question routes - handles all question types
router.post('/', isAuthorized(), validateRequest(createQuestionValidation), QuestionController.createQuestion);
router.get('/', QuestionController.getAllQuestions);
router.get('/:id', QuestionController.getQuestionById);
router.put('/:id', isAuthorized(), validateRequest(updateQuestionValidation), QuestionController.updateQuestion);
router.delete('/:id', isAuthorized(), QuestionController.deleteQuestion);

export default router; 