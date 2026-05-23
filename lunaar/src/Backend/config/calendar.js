import { google } from "googleapis";
import { supabase } from "./supabase.js";
import { oauth2Client } from "./oauth.js";

export const createCalendarEvent = async (chatbot_id, appointment) => {

    const { data: tokenRow, error } = await supabase
    .from("google_oauth_tokens")
    .select("*")
    .eq("chatbot_id", chatbot_id)
    .single();

  if (error || !tokenRow) throw new Error("No OAuth token found for this chatbot");

  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: new Date(tokenRow.expires_at).getTime(),
  });

  // 3. Auto-save refreshed token back to Supabase
  oauth2Client.on("tokens", async (newTokens) => {
    await supabase
      .from("google_oauth_tokens")
      .update({
        access_token: newTokens.access_token,
        expires_at: new Date(newTokens.expiry_date).toISOString(),
      })
      .eq("chatbot_id", chatbot_id);
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // 4. Parse "2025-07-20" + "3:00 PM" into ISO datetime
  const startDateTime = parseDateTime(appointment.date, appointment.time);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

  const event = {
    summary: `Appointment with ${appointment.name}`,
    description: `Booked via chatbot`,
    start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Kolkata" },
    end:   { dateTime: endDateTime.toISOString(),   timeZone: "Asia/Kolkata" },
    attendees: [{ email: appointment.email }],
    reminders: {
      useDefault: false,
      overrides: [{ method: "email", minutes: 60 }],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    sendUpdates: "all",  // sends email invite to attendee
  });

  return response.data.id; // google_event_id
};

function parseDateTime(dateStr, timeStr) {
  // dateStr: "2025-07-20", timeStr: "3:00 PM"
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}