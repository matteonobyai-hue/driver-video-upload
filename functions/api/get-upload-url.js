export async function onRequestPost({ request, env }) {
  const { fileName, fileType } = await request.json();

  if (!fileName || !fileType) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const bucket = env.AWS_BUCKET_NAME;
  const region = env.AWS_REGION;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

  const expiration = 60 * 5; // 5 minutes

  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const shortDate = amzDate.substring(0, 8);
  const credentialScope = `${shortDate}/${region}/s3/aws4_request`;

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const url = `https://${host}/${fileName}`;

  const policy = {
    expiration: new Date(Date.now() + expiration * 1000).toISOString(),
    conditions: [
      { bucket },
      { key: fileName },
      { acl: 'public-read' },
      ['starts-with', '$Content-Type', ''],
      ['content-length-range', 0, 104857600], // max 100MB
      { success_action_status: "201" }
    ]
  };

  const policyBase64 = btoa(JSON.stringify(policy));

  const encoder = new TextEncoder();
  const key = await getSignatureKey(secretAccessKey, shortDate, region, 's3');
  const signature = await hmacHex(key, policyBase64);

  const formFields = {
    key: fileName,
    acl: 'public-read',
    'Content-Type': fileType,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': `${accessKeyId}/${credentialScope}`,
    'x-amz-date': amzDate,
    'policy': policyBase64,
    'x-amz-signature': signature,
    'success_action_status': "201"
  };

  return Response.json({ uploadUrl: url, formFields });
}

async function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = await hmac(`AWS4${key}`, dateStamp);
  const kRegion = await hmac(kDate, regionName);
  const kService = await hmac(kRegion, serviceName);
  const kSigning = await hmac(kService, 'aws4_request');
  return kSigning;
}

async function hmac(key, data) {
  const enc = new TextEncoder();
  const keyBytes = typeof key === 'string' ? enc.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
}

async function hmacHex(key, data) {
  const signature = await hmac(key, data);
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');
}
