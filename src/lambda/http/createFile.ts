import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateFileRequest } from '../../requests/CreateFileRequest'
import { createFile } from '../../controllers/FileController'
import { getUserId } from '../utils';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newFile: CreateFileRequest = JSON.parse(event.body)
  const item = await createFile(getUserId(event), newFile)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
