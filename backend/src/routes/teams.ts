import express from 'express';
import { authenticate } from '../middleware/auth';
import { createTeamValidation, idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as teamController from '../controllers/teamController';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, asyncHandler(teamController.getTeams));
router.get('/:id', idValidation, asyncHandler(teamController.getTeamById));

// Protected routes
router.use(authenticate);

router.post('/', createTeamValidation, asyncHandler(teamController.createTeam));
router.put('/:id', idValidation, asyncHandler(teamController.updateTeam));
router.delete('/:id', idValidation, asyncHandler(teamController.deleteTeam));
router.post('/:id/join', idValidation, asyncHandler(teamController.joinTeam));
router.post('/:id/leave', idValidation, asyncHandler(teamController.leaveTeam));
router.get('/:id/members', idValidation, asyncHandler(teamController.getTeamMembers));
router.post('/:id/invite', idValidation, asyncHandler(teamController.inviteToTeam));
router.post('/:id/kick/:userId', idValidation, asyncHandler(teamController.kickFromTeam));
router.post('/:id/promote/:userId', idValidation, asyncHandler(teamController.promoteToLeader));

export default router;