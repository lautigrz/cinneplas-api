import { ApiException } from "../../common/base/ApiException.js";
import { HttpStatus } from "@nestjs/common";

export class AwsUploadException extends ApiException {
    constructor(key?: string) {
        super(
            key
                ? `Error al subir el archivo "${key}" a S3`
                : "Error al subir el archivo a S3",
            HttpStatus.INTERNAL_SERVER_ERROR,
            "AWS_UPLOAD_FAILED"
        );
    }
}

export class AwsDeleteException extends ApiException {
    constructor(key: string) {
        super(
            `Error al eliminar el archivo "${key}" de S3`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            "AWS_DELETE_FAILED"
        );
    }
}
