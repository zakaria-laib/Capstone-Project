import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUploadUrl } from '../../controllers/FileAttachmentController'
import { getFile, updateFileAttachmentUrl } from '../../controllers/FileController';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const fileId = event.pathParameters.fileId
  const item = await getFile(fileId)
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'File Id: ${fileId} is not found'
      })
    }
  }

  const uploadUrl = getUploadUrl(fileId)
  await updateFileAttachmentUrl(item)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
