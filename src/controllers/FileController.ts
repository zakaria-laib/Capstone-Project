import * as uuid from 'uuid'
import { FileService } from '../services/FileService'
import { CreateFileRequest } from '../requests/CreateFileRequest'
import { FileModel } from '../models/FileModel'

const todoService = new FileService()

export async function createFile(userId: string, createFile: CreateFileRequest): Promise<FileModel> {
  return await todoService.createFile({
    userId,
    FileId: uuid.v4(),
    createdAt: new Date().toISOString(),
    ...createFile
  })
}

export async function getFiles(userId: string): Promise<FileModel[]> {
  return await todoService.getFiles(userId)
}

export async function getFile(FileId: string): Promise<FileModel> {
  return await todoService.getFile(FileId)
}

export async function updateFileAttachmentUrl(file: FileModel) {
  return await todoService.updateFileAttachmentUrl(file)
}

export async function deleteFile(file: FileModel) {
  return await todoService.deleteFile(file)
}
