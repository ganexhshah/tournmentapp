import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createTournamentValidation, idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as tournamentController from '../controllers/tournamentController';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, asyncHandler(tournamentController.getTournaments));
router.get('/:id', idValidation, asyncHandler(tournamentController.getTournamentById));

// Protected routes
router.use(authenticate);

router.post('/', createTournamentValidation, asyncHandler(tournamentController.createTournament));
router.post('/:id/join', idValidation, asyncHandler(tournamentController.joinTournament));
router.post('/:id/leave', idValidation, asyncHandler(tournamentController.leaveTournament));
router.get('/:id/participants', idValidation, asyncHandler(tournamentController.getTournamentParticipants));
router.get('/:id/matches', idValidation, asyncHandler(tournamentController.getTournamentMatches));

// Admin/Moderator routes
router.put('/:id', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(tournamentController.updateTournament));
router.delete('/:id', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(tournamentController.deleteTournament));
router.post('/:id/start', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(tournamentController.startTournament));
router.post('/:id/cancel', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(tournamentController.cancelTournament));

export default router;