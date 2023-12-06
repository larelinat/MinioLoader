import * as Minio from 'minio';
import {ItemBucketMetadata, UploadedObjectInfo} from "minio";
import {ResultCallback} from "minio/dist/main/internal/type";
import * as fs from "fs";
import * as path from 'path';

export interface IParamsMinio {
    endPoint: string,
    useSSL: boolean,
    accessKey: string,
    secretKey: string
}

interface IMinioLoader {
    params: IParamsMinio,
    minioClient: Minio.Client,
    bucketName: string,

    loadFile(
        objectName: string,
        filePath: string,
        metaData?: ItemBucketMetadata | undefined,
        callback?: ResultCallback<UploadedObjectInfo>
    ): void

    loadFolder(
        folderName: string,
        folderPath: string,
        metadata: ItemBucketMetadata | undefined,
        callback?: ResultCallback<UploadedObjectInfo>
    ): void
}

class MinioLoader implements IMinioLoader {
    params: IParamsMinio;
    minioClient: Minio.Client;
    bucketName: string;

    constructor(params: IParamsMinio, bucketName: string) {
        this.params = params;
        this.bucketName = bucketName;
        this.minioClient = new Minio.Client(this.params);
    }

    loadFile(objectName: string, filePath: string, metaData: ItemBucketMetadata, callback: ResultCallback<UploadedObjectInfo>): void {
        this.minioClient.fPutObject(this.bucketName, objectName, filePath, metaData, callback);
    }

    loadFolder(folderName: string, folderPath: string, metadata: ItemBucketMetadata, callback: ResultCallback<UploadedObjectInfo>): void {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                throw err;
            }
            files.forEach(file => {
                fs.stat(folderPath + '/' + file, (errStat, stat) => {
                    if (errStat) {
                        throw errStat;
                    }
                    if (stat.isDirectory()) {

                        this.loadFolder(folderName + '/' + file, folderPath + '/' + file, metadata, callback);
                    }
                    else {
                        this.loadFile(folderName + '/' + file, folderPath + '/' + file, metadata, callback);
                    }
                })
            });
        })
    }
}

export default MinioLoader;