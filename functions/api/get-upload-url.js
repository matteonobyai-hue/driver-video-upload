export async function onRequestGet() {
  const { AwsClient } = await import('aws4fetch');

  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET_NAME;
  const endpoint = process.env.S3_ENDPOINT;

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const key = `uploads/${Date.now()}.mp4`;

  const signed = await client.sign(
    `${endpoint}/${bucket}/${key}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4"
      },
    }
  );

  return new Response(JSON.stringify({
    uploadURL: signed.url,
    key,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
