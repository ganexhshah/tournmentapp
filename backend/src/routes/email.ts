import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendEmail, verifyEmailConfig, sendTournamentInvitation } from '../services/emailService';

const router = express.Router();

// Test email configuration (Admin only)
router.post('/test-config', 
  authenticate, 
  authorize('ADMIN'), 
  asyncHandler(async (req: Request, res: Response) => {
    const isValid = await verifyEmailConfig();
    res.json({ 
      message: isValid ? 'Email configuration is valid' : 'Email configuration failed',
      isValid 
    });
  })
);

// Send test email (Admin only)
router.post('/test-send', 
  authenticate, 
  authorize('ADMIN'), 
  asyncHandler(async (req: Request, res: Response) => {
    const { to, template = 'welcome' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    try {
      await sendEmail({
        to,
        subject: '🧪 CrackZone Test Email',
        template,
        data: {
          username: 'Test User',
          verificationUrl: 'https://example.com/verify',
          resetUrl: 'https://example.com/reset'
        }
      });

      res.json({ message: 'Test email sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send test email' });
    }
  })
);

// Send tournament invitation (Admin/Moderator only)
router.post('/tournament-invitation',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      email, 
      username, 
      tournamentName, 
      game, 
      startDate, 
      entryFee, 
      prizePool, 
      maxParticipants,
      joinUrl 
    } = req.body;

    if (!email || !username || !tournamentName) {
      return res.status(400).json({ error: 'Email, username, and tournament name are required' });
    }

    try {
      await sendTournamentInvitation(email, username, {
        tournamentName,
        game,
        startDate,
        entryFee,
        prizePool,
        maxParticipants,
        joinUrl
      });

      res.json({ message: 'Tournament invitation sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send tournament invitation' });
    }
  })
);

export default router;