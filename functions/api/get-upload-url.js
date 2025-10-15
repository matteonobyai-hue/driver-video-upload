export async function onRequestPost({ request, env }) {
  try {
    const { fileName, fileType } = await request.json();

    // Salva l'oggetto nel bucket (vuoto o con placeholder)
    await env.MY_R2_BUCKET.put(fileName, new Uint8Array(), {
      httpMetadata: { contentType: fileType },
    });

    // Costruisci l'URL pubblico (statico, bucket configurato come pubblico)
    const uploadUrl = `https://videos-driver.r2.dev/${fileName}`;

    return new Response(
      JSON.stringify({ uploadUrl }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Errore interno', details: err.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
