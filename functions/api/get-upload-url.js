export async function onRequestPost(context) {
  const { fileName, fileType } = await context.request.json();

  const accountId = 'a20f4c50d50b88091cc283a249544f43';
  const bucket = 'videos-driver';
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  const accessKeyId = '3c246b59f0f8bd24fc62e14addf0dba1';
  const secretAccessKey = '5e6504bca6543a01e00184cac86c746f73b1afac8ecfbfcbdba238575b6d21f73';

  const expiresInSeconds = 3600; // 1 ora

  const url = new URL(`${endpoint}/${bucket}/${fileName}`);
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const signature = btoa(`${accessKeyId}:${secretAccessKey}`);

  const signedUrl = `${url}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(
    accessKeyId
  )}&X-Amz-Date=${new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')}&X-Amz-Expires=${expiresInSeconds}&X-Amz-SignedHeaders=host`;

  return new Response(JSON.stringify({ uploadUrl: signedUrl }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
