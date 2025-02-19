// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Hello from Functions!")

const EMAIL_API_KEY = 're_Ut7uanir_AjhxoiwBQHYtMQmonwqJijdS';

serve(async (req) => {
  // Handle CORS pre-flight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, diplomaUrl, diplomaTitle, studentName } = await req.json();

    if (!email || !diplomaUrl || !diplomaTitle || !studentName) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construct the email body
    const emailBody = `
    <p>Cher/Chère ${studentName},</p>
    <p>Nous avons le plaisir de vous informer que votre diplôme "${diplomaTitle}" est maintenant disponible.</p>
    <p>Vous pouvez le consulter et le télécharger en cliquant sur le lien suivant : <a href="${diplomaUrl}">${diplomaUrl}</a></p>
    <p>Cordialement,<br/>L'équipe de l'Université</p>
  `;

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'diplomas@example.com', // Replace with your "from" email address
        to: email,
        subject: `Votre diplôme "${diplomaTitle}" est disponible`,
        html: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendResponse.json();
    console.log('Resend success:', resendData);

    return new Response(
      JSON.stringify({ data: 'Email sent successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-diploma-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
