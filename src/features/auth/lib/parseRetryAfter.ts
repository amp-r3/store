const RETRY_AFTER_PATTERN = /after (\d+) seconds?/i;

/** GoTrue's 429 body is prose: "For security purposes, you can only request
 *  this after 47 seconds." Pull the number out to seed the resend cooldown. */
export const parseRetryAfter = (message: string, fallbackSeconds = 60): number => {
  const match = RETRY_AFTER_PATTERN.exec(message);
  return match ? Number(match[1]) : fallbackSeconds;
};
