/**
 * Time-based Greeting Utility
 * 05:00 AM – 11:59 AM -> 🌅 Good Morning
 * 12:00 PM – 04:59 PM -> ☀️ Good Afternoon
 * 05:00 PM – 08:59 PM -> 🌇 Good Evening
 * 09:00 PM – 04:59 AM -> 🌙 Good Night
 */
export function getGreeting(displayName = "") {
  const now = new Date();
  const hours = now.getHours();
  const nameSuffix = displayName ? `, ${displayName}` : "";

  if (hours >= 5 && hours < 12) {
    return { text: `Good Morning${nameSuffix}`, icon: "🌅" };
  } else if (hours >= 12 && hours < 17) {
    return { text: `Good Afternoon${nameSuffix}`, icon: "☀️" };
  } else if (hours >= 17 && hours < 21) {
    return { text: `Good Evening${nameSuffix}`, icon: "🌇" };
  } else {
    return { text: `Good Night${nameSuffix}`, icon: "🌙" };
  }
}
