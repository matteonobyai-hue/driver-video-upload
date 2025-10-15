// functions/api/get-upload-url.js

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function onRequestPost(context) {
  const { request } = context;
  const body = await request.json();

  const { fileName, fileType } = body;

  const s3 = new S3Client({
    region: "auto",
    endpoint: "https://a20f4c50d50b88091cc283a249544f43.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: "3c246b59f0f8bd24fc62e14addf0dba1",
      secretAccessKey: "5e6504bca6543a01e00184cac86c746f73b1afac8ecfbfcbd238575b6d21f73"
    }
  });

  const command = new PutObjectCommand({
    Bucket: "videos-driver",
    Key: fileName,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return new Response(JSON.stringify({ uploadUrl }), {
    headers: { "Content-Type": "application/json" }
  });
}
