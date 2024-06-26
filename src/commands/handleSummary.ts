import log from "../logger";
import { makeSurveyPost } from "@lib/index";

export const handleSummary = async (
  interaction: any,
  surveyName: any,
  redisClient: any,
  summaryType: any,
) => {
  try {
    const validStatuses = ["yes", "no"];
    if (!validStatuses.includes(summaryType)) {
      await interaction.reply({
        content: "Invalid summary type. Please choose 'yes' or 'no'.",
        ephemeral: true,
      });
      return;
    }

    if (summaryType == "yes") {
      // High level summary
      log.debug("Summary type is high level summary.");
      const executiveSummary = await redisClient.get(
        `survey:${surveyName}:executive-summary`,
      );
      log.debug(executiveSummary);
      await interaction.reply(
        formatExecutiveSummaryForDiscord(executiveSummary),
      );
    } else {
      log.debug("Summary type is general summary.");
      const messagesToSend = await makeSurveyPost(
        redisClient,
        surveyName,
        true,
      );
      for (const [i, toSend] of messagesToSend.entries()) {
        if (i === 0) {
          await interaction.reply(toSend);
        } else {
          await interaction.followUp(toSend);
        }
      }
    }
  } catch (error) {
    log.error("Error setting summary type:", error);
    await interaction.reply({
      content: "There was an error setting the summary type.",
      ephemeral: true,
    });
  }
};

function formatExecutiveSummaryForDiscord(summary: string): string {
  const formattedSummary = summary.trim();

  return `**Executive Summary:**\n\n${formattedSummary}`;
}
