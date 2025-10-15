import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});

export async function onRequestPost(context) {
  const { fileName, fileType } = await context.request.json();

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return new Response(JSON.stringify({ uploadUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}
