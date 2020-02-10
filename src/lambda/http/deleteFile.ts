import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { deleteFile, getFile } from '../../controllers/FileController'
import { deleteAttachment } from '../../controllers/FileAttachmentController'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const fileId = event.pathParameters.fileId
  const item = await getFile(fileId)
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'File ID : ${fileId} is not found'
      })
    }
  }

  await deleteFile(item)
  await deleteAttachment(fileId)

  return {
    statusCode: 202,
    body: ""
  }
})

handler.use(
  cors({
    credentials: true
  })
)
