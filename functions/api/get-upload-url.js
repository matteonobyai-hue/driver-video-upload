export async function onRequestPost(context) {
  const { request, env } = context;

  const { fileName, fileType } = await request.json();

  const objectKey = fileName;

  const uploadUrl = `https://${context.env.MY_R2_BUCKET}.r2.dev/${objectKey}`;

  // Scrivi l'oggetto nel bucket con fetch() su R2 usando il binding
  const r2Object = await env.MY_R2_BUCKET.put(objectKey, null, {
    httpMetadata: {
      contentType: fileType
    }
  });

  return new Response(JSON.stringify({ uploadUrl }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
