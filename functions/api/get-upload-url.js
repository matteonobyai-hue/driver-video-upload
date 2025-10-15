export async function onRequestPost(context) {
  const { request, env } = context;
  const { fileName, fileType } = await request.json();

  if (!fileName || !fileType) {
    return new Response(JSON.stringify({ error: 'Missing fileName or fileType' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const objectKey = `${Date.now()}_${fileName}`;

  const signedUrl = await env.MY_R2_BUCKET.createPresignedUrl(
    objectKey,
    {
      method: 'PUT',
      expiry: 60 * 5, // 5 minuti
      headers: {
        'Content-Type': fileType,
      },
    }
  );

  return new Response(JSON.stringify({ uploadUrl: signedUrl }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
