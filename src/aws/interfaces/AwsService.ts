export interface AwsService {
    uploadFile(file: Buffer, directory: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
}

export const AWS_SERVICE = Symbol("AWS_SERVICE");