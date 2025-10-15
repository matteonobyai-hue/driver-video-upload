export async function onRequestPost(context) {
  const { request, env } = context;
  const { fileName, fileType } = await request.json();

  if (!fileName || !fileType) {
    return new Response("Missing fileName or fileType", { status: 400 });
  }

  const bucket = env.R2_BUCKET;
  const url = new URL(`https://${bucket}.r2.cloudflarestorage.com/${fileName}`);

  const headers = new Headers();
  headers.set("x-amz-acl", "public-read");
  headers.set("Content-Type", fileType);

  const putRequest = new Request(url, {
    method: "PUT",
    headers,
  });

  const signedUrl = url.toString();

  return Response.json({
    uploadUrl: signedUrl,
  });
}
