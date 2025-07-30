import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BadgeService {
	// Get badge metadata (e.g., for display)
	async getBadgeMetadata(badgeId: string) {
		return await prisma.achievement.findUnique({
			where: { id: badgeId },
			select: {
				id: true,
				name: true,
				description: true,
				badgeUrl: true,
				category: true,
				rarity: true,
			},
		});
	}

	// Notify user of badge (e.g., send email)
	async notifyUserOfBadge(userId: string, badgeId: string) {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		const badge = await this.getBadgeMetadata(badgeId);
		if (!user || !badge) return;
		try {
			const EmailNotifier = (await import('../utils/service/emailNotifier')).default;
			await EmailNotifier.sendAchievementEmail(
				user.email,
				badge.name,
				badge.description,
				badge.badgeUrl,
				0 // XP bonus for badge notification only
			);
		} catch (err) {
			// Log but do not block
			console.error('Failed to send badge notification:', err);
		}
	}

	// Generate achievement certificate/summary (could be a PDF, image, or data object)
	async generateCertificate(userId: string, achievementId: string) {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } });
		if (!user || !achievement) return null;
		// Return a summary object
		const summary = {
			userName: user.firstName + ' ' + user.lastName,
			achievementName: achievement.name,
			achievementDescription: achievement.description,
			badgeUrl: achievement.badgeUrl,
			date: new Date().toISOString(),
		};
		// PDF generation stub (implement with a library like pdfkit if needed)
		// e.g., generate PDF and return file path or buffer
		return summary;
	}
}
