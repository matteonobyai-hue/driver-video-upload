import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function onRequestPost(context) {
  const { fileName, fileType } = await context.request.json();

  const s3 = new S3Client({
    region: "eu-north-1", // o la tua vera regione
    credentials: {
      accessKeyId: context.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  const command = new PutObjectCommand({
    Bucket: context.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  return new Response(JSON.stringify({ uploadUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}
