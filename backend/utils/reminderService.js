import Reminder from '../models/Reminder.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import sendEmail from './emailService.js';

export const checkAndSendReminders = async () => {
    try {
        console.log('Checking for movie reminders...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find reminders that haven't been sent yet
        const pendingReminders = await Reminder.find({ isSent: false }).populate('user').populate('movie');

        for (const reminder of pendingReminders) {
            const movieReleaseDate = new Date(reminder.movie.releaseDate);
            movieReleaseDate.setHours(0, 0, 0, 0);

            // If the movie's release date is today or in the past, send the reminder
            if (movieReleaseDate <= today) {
                // Prepare the email UI
                const emailHtml = `
                    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                        <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #e2e8f0; letter-spacing: 1px;">Reel<span style="color: #3b82f6;">Verse</span></h1>
                            <p style="margin: 10px 0 0; color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Movie Release Alert</p>
                        </div>
                        
                        <div style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #f8fafc;">Hi ${reminder.user.name},</h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                                The wait is over! <strong style="color: #3b82f6; font-size: 18px;">${reminder.movie.title}</strong> is finally out in cinemas.
                                As requested, we are reminding you so you can grab the best seats before they run out.
                            </p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/movie/${reminder.movie._id}" 
                                   style="display: inline-block; padding: 16px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                                    Book Now
                                </a>
                            </div>
                            
                            <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                                    <strong>Tip:</strong> Log in to your ReelVerse account to use any available discount coupons for your booking.
                                </p>
                            </div>
                        </div>
                        
                        <div style="padding: 20px 30px; text-align: center; background-color: #0b1120; border-top: 1px solid #1e293b;">
                            <p style="margin: 0; color: #64748b; font-size: 12px;">
                                &copy; ${new Date().getFullYear()} ReelVerse Cinemas. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; color: #475569; font-size: 11px;">
                                You received this email because you clicked 'Remind Me' for ${reminder.movie.title}.
                            </p>
                        </div>
                    </div>
                `;

                try {
                    await sendEmail({
                        email: reminder.user.email,
                        subject: `🍿 It's Here! ${reminder.movie.title} is now in cinemas`,
                        message: emailHtml
                    });

                    // Mark as sent
                    reminder.isSent = true;
                    await reminder.save();
                    console.log(`Reminder sent to ${reminder.user.email} for ${reminder.movie.title}`);
                } catch (emailError) {
                    console.error(`Failed to send reminder to ${reminder.user.email}:`, emailError);
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAndSendReminders:', error);
    }
};
