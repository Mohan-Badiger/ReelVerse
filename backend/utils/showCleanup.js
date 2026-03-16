import Show from '../models/Show.js';

/**
 * Deletes past showtimes from the database.
 * A show is considered "past" if its date is strictly before today (00:00:00 local time).
 */
export const cleanupOldShows = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today (local time)

        const result = await Show.deleteMany({
            date: { $lt: today }
        });

        if (result.deletedCount > 0) {
            console.log(`[Show Cleanup] Successfully deleted ${result.deletedCount} past showtimes.`);
        } else {
            console.log('[Show Cleanup] No past showtimes found to delete.');
        }
    } catch (error) {
        console.error('[Show Cleanup Error]:', error);
    }
};
