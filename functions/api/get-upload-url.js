export async function onRequestPost({ request, env }) {
  try {
    const { fileName, fileType } = await request.json();

    const objectUrl = `https://${env.MY_R2_BUCKET}.r2.dev/${fileName}`;

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': fileType,
    };

    await env.MY_R2_BUCKET.put(fileName, await request.arrayBuffer(), {
      httpMetadata: {
        contentType: fileType,
      },
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
