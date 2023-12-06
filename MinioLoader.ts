import * as Minio from 'minio';
import {ItemBucketMetadata, NoResultCallback, UploadedObjectInfo} from "minio";
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
        metadata?: ItemBucketMetadata | undefined,
        callback?: ResultCallback<UploadedObjectInfo>
    ): void

    getObject(
        objectName: string,
    ): Promise<any>
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
        fs.readdirSync(folderPath).forEach(file => {
            fs.statSync(folderPath + '/' + file).isDirectory()
                ? this.loadFolder(folderName + '/' + file, folderPath + '/' + file, metadata, callback)
                : this.loadFile(folderName + '/' + file, folderPath + '/' + file, metadata, callback);
        })
    }

    getObject(objectName: string) {
        //this.minioClient.fGetObject(this.bucketName, objectName, filePath, callback);
        let size = 0;

        return new Promise((resolve, reject) => {
            this.minioClient.getObject(this.bucketName, objectName, (err, dataStream) => {
                if (err) {
                    reject(err);
                } else {
                    dataStream.on('data', (chunk) => {
                        size += chunk.length;
                    });
                    dataStream.on('end', () => {
                        resolve(size);
                    });
                    dataStream.on('error', (err) => {
                        reject(err);
                    });
                }
            })
        })

        /*this.minioClient.getObject(this.bucketName, objectName)
            .then((dataStream) => {

              console.log(dataStream);
            })*/
    }


}

export default MinioLoader;