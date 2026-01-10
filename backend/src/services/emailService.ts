import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const templates = {
  verification: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎮 Welcome to CrackZone!</h1>
        </div>
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.username}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for joining the ultimate gaming tournament platform! You're just one step away from competing with the best gamers worldwide.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Please use this verification code in the mobile app:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 32px; letter-spacing: 8px; font-family: monospace;">
              ${data.verificationOTP}
            </div>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">
            This code will expire in 10 minutes for security.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #333; margin-top: 0;">What's waiting for you:</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li>🏆 Join exciting tournaments</li>
              <li>👥 Create and manage teams</li>
              <li>💰 Win prizes and rewards</li>
              <li>📊 Track your gaming stats</li>
              <li>🎯 Climb the leaderboards</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            If you didn't create an account with CrackZone, please ignore this email.
          </p>
        </div>
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 CrackZone Gaming Platform. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to CrackZone! 🎮
      
      Hi ${data.username},
      
      Thank you for joining the ultimate gaming tournament platform! 
      
      Your verification code is: ${data.verificationOTP}
      
      Please enter this code in the mobile app to verify your account.
      This code will expire in 10 minutes.
      
      What's waiting for you:
      • Join exciting tournaments
      • Create and manage teams  
      • Win prizes and rewards
      • Track your gaming stats
      • Climb the leaderboards
      
      If you didn't create an account with CrackZone, please ignore this email.
      
      Happy Gaming!
      The CrackZone Team
    `
  }),

  'password-reset': (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.username}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We received a request to reset your password for your CrackZone account. No worries, it happens to the best of us!
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.resetUrl}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
              🔑 Reset Password
            </a>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: #856404;">
              ⚠️ <strong>Security Notice:</strong> This reset link will expire in 1 hour for your security.
            </p>
          </div>
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #ff6b6b; font-size: 14px; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${data.resetUrl}
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 CrackZone Gaming Platform. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request 🔐
      
      Hi ${data.username},
      
      We received a request to reset your password for your CrackZone account.
      
      Please visit this link to reset your password:
      ${data.resetUrl}
      
      This reset link will expire in 1 hour for your security.
      
      If you didn't request a password reset, please ignore this email.
      
      Stay secure!
      The CrackZone Team
    `
  }),

  welcome: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to CrackZone!</h1>
        </div>
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.username}! 🎮</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your email has been verified successfully! Welcome to the CrackZone gaming community where legends are born!
          </p>
          <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h3 style="color: white; margin-top: 0;">🚀 You're all set! Here's what you can do now:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
              <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">🏆</div>
                <div style="color: white; font-weight: bold;">Join Tournaments</div>
              </div>
              <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                <div style="color: white; font-weight: bold;">Create Teams</div>
              </div>
              <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                <div style="color: white; font-weight: bold;">Win Rewards</div>
              </div>
              <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                <div style="color: white; font-weight: bold;">Track Stats</div>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
              🎮 Start Gaming Now
            </a>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center;">
            Ready to dominate the leaderboards? Let's go! 🚀
          </p>
        </div>
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 CrackZone Gaming Platform. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to CrackZone! 🎉
      
      Hi ${data.username},
      
      Your email has been verified successfully! Welcome to the CrackZone gaming community.
      
      You can now:
      🏆 Join tournaments and compete with other players
      👥 Create or join teams
      💰 Earn rewards and climb the leaderboards  
      📊 Track your gaming statistics
      🎮 Connect with fellow gamers
      
      Visit ${process.env.FRONTEND_URL} to start gaming!
      
      Ready to dominate the leaderboards? Let's go! 🚀
      
      Happy gaming!
      The CrackZone Team
    `
  }),

  'tournament-invitation': (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Tournament Invitation</h1>
        </div>
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.username}! 🎮</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You've been invited to join an exciting tournament: <strong>${data.tournamentName}</strong>
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #333; margin-top: 0;">Tournament Details:</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li><strong>Game:</strong> ${data.game}</li>
              <li><strong>Start Date:</strong> ${data.startDate}</li>
              <li><strong>Entry Fee:</strong> ${data.entryFee} coins</li>
              <li><strong>Prize Pool:</strong> ${data.prizePool} coins</li>
              <li><strong>Max Participants:</strong> ${data.maxParticipants}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.joinUrl}" 
               style="background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
              🚀 Join Tournament
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Tournament Invitation 🏆
      
      Hi ${data.username},
      
      You've been invited to join: ${data.tournamentName}
      
      Tournament Details:
      • Game: ${data.game}
      • Start Date: ${data.startDate}
      • Entry Fee: ${data.entryFee} coins
      • Prize Pool: ${data.prizePool} coins
      
      Join now: ${data.joinUrl}
      
      Good luck!
      The CrackZone Team
    `
  })
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const template = templates[options.template as keyof typeof templates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { html, text } = template(options.data);

    const mailOptions = {
      from: `"🎮 CrackZone Gaming" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 Sent to:', options.to);
    console.log('📝 Subject:', options.subject);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, username: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: '🎉 Welcome to CrackZone - Let the Games Begin!',
    template: 'welcome',
    data: { username }
  });
};

// Send tournament invitation
export const sendTournamentInvitation = async (
  email: string, 
  username: string, 
  tournamentData: any
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `🏆 You're Invited: ${tournamentData.tournamentName}`,
    template: 'tournament-invitation',
    data: { username, ...tournamentData }
  });
};