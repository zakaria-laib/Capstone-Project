import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { FileModel } from '../models/FileModel';

const XAWS = AWSXRay.captureAWS(AWS)

export class FileService {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly FilesTable = process.env.FILES_TABLE,
    private readonly FileIdIndex = process.env.FILE_INDEX,
    private readonly bucketName = process.env.FILES_S3_BUCKET
  ) { }

  async createFile(File: FileModel): Promise<FileModel> {
    await this.docClient.put({
      TableName: this.FilesTable,
      Item: File
    }).promise()

    return File
  }

  async getFiles(userId: string): Promise<FileModel[]> {
    const result = await this.docClient.query({
      TableName: this.FilesTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as FileModel[]
  }

  async getFile(FileId: string): Promise<FileModel> {
    const result = await this.docClient.query({
      TableName: this.FilesTable,
      IndexName: this.FileIdIndex,
      KeyConditionExpression: 'fileId = :fileId',
      ExpressionAttributeValues: {
        ':fileId': FileId
      }
    }).promise()

    return result.Items[0] as FileModel
  }

  async updateFileAttachmentUrl(File: FileModel) {
    await this.docClient.update({
      TableName: this.FilesTable,
      Key: {
        userId: File.userId,
        createdAt: File.createdAt
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${File.FileId}`
      }
    }).promise()
  }

  async deleteFile(File: FileModel) {
    await this.docClient.delete({
      TableName: this.FilesTable,
      Key: {
        userId: File.userId,
        createdAt: File.createdAt
      }
    }).promise()
  }
}

export class FileAttachmentService {
  constructor(
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.FILES_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
  ) { }

  getUploadUrl(FileId: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: FileId,
      Expires: this.urlExpiration
    })
  }

  async deleteAttachment(FileId: string) {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: FileId
    }).promise()
  }
}
