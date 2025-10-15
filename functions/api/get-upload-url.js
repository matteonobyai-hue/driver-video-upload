export async function onRequestPost({ request, env }) {
  try {
    const { fileName, fileType } = await request.json();

    const objectUrl = `https://${env.MY_R2_BUCKET}.r2.dev/${fileName}`;

    // Prepariamo un oggetto vuoto nel bucket, Cloudflare R2 usa .put()
    await env.MY_R2_BUCKET.put(fileName, new Uint8Array(), {
      httpMetadata: { contentType: fileType },
    });

    return new Response(
      JSON.stringify({ uploadUrl: objectUrl }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Errore nel caricamento', details: err.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
