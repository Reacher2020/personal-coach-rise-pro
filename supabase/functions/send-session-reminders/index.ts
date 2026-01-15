import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  client_id: string;
  coach_id: string;
  client_name?: string;
  coach_name?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Allow 5 minute window for each check
    const oneHourWindowEnd = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000);
    const twentyFourWindowEnd = new Date(twentyFourHoursFromNow.getTime() + 5 * 60 * 1000);

    console.log(`Checking for sessions between ${oneHourFromNow.toISOString()} - ${oneHourWindowEnd.toISOString()} (1h reminder)`);
    console.log(`Checking for sessions between ${twentyFourHoursFromNow.toISOString()} - ${twentyFourWindowEnd.toISOString()} (24h reminder)`);

    // Get sessions for 1h reminder
    const { data: sessionsFor1h, error: error1h } = await supabase
      .from("training_sessions")
      .select(`
        id,
        title,
        scheduled_at,
        client_id,
        coach_id
      `)
      .gte("scheduled_at", oneHourFromNow.toISOString())
      .lt("scheduled_at", oneHourWindowEnd.toISOString())
      .eq("status", "scheduled");

    if (error1h) {
      console.error("Error fetching 1h sessions:", error1h);
    }

    // Get sessions for 24h reminder
    const { data: sessionsFor24h, error: error24h } = await supabase
      .from("training_sessions")
      .select(`
        id,
        title,
        scheduled_at,
        client_id,
        coach_id
      `)
      .gte("scheduled_at", twentyFourHoursFromNow.toISOString())
      .lt("scheduled_at", twentyFourWindowEnd.toISOString())
      .eq("status", "scheduled");

    if (error24h) {
      console.error("Error fetching 24h sessions:", error24h);
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Process 1h reminders
    for (const session of sessionsFor1h || []) {
      const sent = await sendReminder(supabase, session, "1h", errors);
      if (sent) sentCount++;
    }

    // Process 24h reminders
    for (const session of sessionsFor24h || []) {
      const sent = await sendReminder(supabase, session, "24h", errors);
      if (sent) sentCount++;
    }

    console.log(`Sent ${sentCount} reminders. Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-session-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function sendReminder(
  supabase: ReturnType<typeof createClient>,
  session: Session,
  reminderType: "1h" | "24h",
  errors: string[]
): Promise<boolean> {
  try {
    // Check if reminder already sent
    const { data: existingReminder } = await supabase
      .from("session_reminders")
      .select("id")
      .eq("session_id", session.id)
      .eq("reminder_type", reminderType)
      .maybeSingle();

    if (existingReminder) {
      console.log(`Reminder ${reminderType} already sent for session ${session.id}`);
      return false;
    }

    // Get client details to find their user_id for messaging
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, user_id")
      .eq("id", session.client_id)
      .maybeSingle();

    if (clientError || !client) {
      console.error(`Client not found for session ${session.id}:`, clientError);
      errors.push(`Client not found for session ${session.id}`);
      return false;
    }

    // Format the session time nicely
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const formattedTime = sessionDate.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create reminder message content
    const timeLabel = reminderType === "1h" ? "za godzinę" : "jutro";
    const messageContent = `📅 Przypomnienie: Twoja sesja treningowa "${session.title}" odbędzie się ${timeLabel} (${formattedDate} o ${formattedTime}). Do zobaczenia!`;

    // Insert message to the client
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        coach_id: session.coach_id,
        client_id: session.client_id,
        content: messageContent,
        is_from_coach: true,
        read: false,
      });

    if (messageError) {
      console.error(`Error sending message for session ${session.id}:`, messageError);
      errors.push(`Error sending message for session ${session.id}: ${messageError.message}`);
      return false;
    }

    // Record that reminder was sent
    const { error: reminderError } = await supabase
      .from("session_reminders")
      .insert({
        session_id: session.id,
        reminder_type: reminderType,
      });

    if (reminderError) {
      console.error(`Error recording reminder for session ${session.id}:`, reminderError);
      // Don't fail - message was already sent
    }

    console.log(`Sent ${reminderType} reminder for session ${session.id} to client ${client.name}`);
    return true;
  } catch (error) {
    console.error(`Error processing reminder for session ${session.id}:`, error);
    errors.push(`Error processing session ${session.id}: ${error.message}`);
    return false;
  }
}
