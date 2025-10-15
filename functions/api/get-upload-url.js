import { AwsClient } from 'aws4fetch'

export async function onRequestPost({ request }) {
  const { fileName, fileType } = await request.json()

  const bucket = 'videos-driver'
  const region = 'auto'
  const accountId = 'a20f4c50d50b88091cc283a249544f43'
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

  const url = `${endpoint}/${bucket}/${fileName}`

  const client = new AwsClient({
    accessKeyId: '3c246b59f0f8bd24fc62e14addf0dba1',
    secretAccessKey: '5e6504bca6543a01e00184cac86c746f73b1afac8ecfbfcbdba238575b6d21f73',
    service: 's3',
    region
  })

  const signed = await client.sign(url, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType
    }
  })

  return new Response(JSON.stringify({ uploadUrl: signed.url }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
