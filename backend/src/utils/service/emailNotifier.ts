import ZohoMailer from "./nodeMailer";


class EmailNotifier {
  public static async sendAccountActivationEmail(email: string, link: string) {
    const message = `Welcome to AURORA. Click on this to activate your account: ${link}`;
    const subject = "Activate your account";
    const mailer = new ZohoMailer();
    await mailer.sendTextEmail(email, subject, message);
  }

  public static async sendAchievementEmail(
    email: string,
    achievementName: string,
    achievementDescription: string,
    badgeUrl: string,
    xpBonus: number
  ) {
    const subject = `🎉 You've earned a new achievement: ${achievementName}!`;
    const message = `
      <div style="font-family:Arial,sans-serif;">
        <h2>Congratulations!</h2>
        <p>You've earned the <b>"${achievementName}"</b> badge.</p>
        <p>${achievementDescription}</p>
        <img src="${badgeUrl}" alt="Badge" style="height:64px;">
        <p><b>Bonus XP:</b> +${xpBonus}</p>
        <p>Keep up the amazing progress!</p>
      </div>
    `;
    const mailer = new ZohoMailer();
    await mailer.sendHtmlEmail(email, subject, message);
  }
}

export default EmailNotifier;