export async function onRequestGet(context) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION } = context.env;

  const crypto = require('crypto');

  const bucket = AWS_BUCKET_NAME;
  const region = AWS_REGION;
  const key = `uploads/${crypto.randomUUID()}.mp4`;
  const expiresIn = 900;

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const url = `https://${host}/${key}`;

  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = datetime.slice(0, 8);

  const credential = `${AWS_ACCESS_KEY_ID}/${date}/${region}/s3/aws4_request`;
  const policy = {
    expiration: new Date(Date.now() + expiresIn * 1000).toISOString(),
    conditions: [
      { bucket },
      { key },
      { acl: 'public-read' },
      ['starts-with', '$Content-Type', 'video/'],
      { 'x-amz-credential': credential },
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-date': datetime },
    ],
  };

  const base64Policy = Buffer.from(JSON.stringify(policy)).toString('base64');

  const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  };

  const signature = crypto
    .createHmac('sha256', getSignatureKey(AWS_SECRET_ACCESS_KEY, date, region, 's3'))
    .update(base64Policy)
    .digest('hex');

  return new Response(
    JSON.stringify({
      url,
      fields: {
        key,
        acl: 'public-read',
        'Content-Type': 'video/mp4',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': credential,
        'x-amz-date': datetime,
        'x-amz-signature': signature,
        policy: base64Policy,
      },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
