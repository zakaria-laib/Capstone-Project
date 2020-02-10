import { FileAttachmentService } from '../services/FileService'
const AttachmentService = new FileAttachmentService()

export function getUploadUrl(FileId: string): string {
    return AttachmentService.getUploadUrl(FileId)
}

export async function deleteAttachment(FileId: string) {
    return await AttachmentService.deleteAttachment(FileId)
}
