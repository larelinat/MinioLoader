import * as Minio from 'minio';
import {ItemBucketMetadata, UploadedObjectInfo} from "minio";
import {ResultCallback} from "minio/dist/main/internal/type";
import * as fs from "fs";


/**
 * Interface for MinioLoader class params to constructor
 *
 * @interface IParamsMinio
 * @property {string} endPoint - Minio endpoint
 * @property {boolean} useSSL - Use SSL or not
 * @property {string} accessKey - Access key to Minio
 * @property {string} secretKey - Secret key to Minio
 */
export interface IParamsMinio {
    endPoint: string,
    useSSL: boolean,
    accessKey: string,
    secretKey: string
}

/**
 * Class MinioLoader that use Minio to upload and download files and folders with one bucket.
 * @class MinioLoader
 */
class MinioLoader {
    /**
     * @property {IParamsMinio} params - params to initialize a connection
     * @property {Minio.Client} minioClient - Minio client
     * @property {string} bucketName - bucket name
     */
    params: IParamsMinio;
    minioClient: Minio.Client;
    bucketName: string;

    /**
     * @param {IParamsMinio} params - params to initialize a connection
     * @param {string} bucketName - bucket name
     */
    constructor(params: IParamsMinio, bucketName: string) {
        this.params = params;
        this.bucketName = bucketName;
        this.minioClient = new Minio.Client(this.params);
    }

    /**
     * @method loadFile - load a file to bucket
     * @param {string} objectName - name of object in bucket
     * @param {string} filePath - path to file on local pc
     * @param {ItemBucketMetadata} metaData - metadata for object
     * @param {ResultCallback<UploadedObjectInfo>} callback - callback for loading file
     */
    loadFile(objectName: string, filePath: string, metaData: ItemBucketMetadata, callback: ResultCallback<UploadedObjectInfo>): void {
        this.minioClient.fPutObject(this.bucketName, objectName, filePath, metaData, callback);
    }

    /**
     * @method loadFolder - load a folder to bucket
     * @param {string} folderName - name of folder in bucket
     * @param {string} folderPath - path to folder on local pc
     * @param {ItemBucketMetadata} metadata - metadata for folder and files
     * @param {ResultCallback<UploadedObjectInfo>} callback - callback for loading folder
     */
    loadFolder(folderName: string, folderPath: string, metadata: ItemBucketMetadata, callback: ResultCallback<UploadedObjectInfo>): void {
        fs.readdirSync(folderPath).forEach(file => {
            fs.statSync(folderPath + '/' + file).isDirectory()
                ? this.loadFolder(folderName + '/' + file, folderPath + '/' + file, metadata, callback)
                : this.loadFile(folderName + '/' + file, folderPath + '/' + file, metadata, callback);
        })
    }

    /**
     * @method getObject - get object from bucket
     * @param {string} objectName - name of object in bucket
     * @returns {Promise<string>} - asyncly returns content of the object
     */
    getObject(objectName: string): Promise<string> {
        let buffer = '';

        return new Promise((resolve, reject) => {
            this.minioClient.getObject(this.bucketName, objectName, (err, dataStream) => {
                if (err) {
                    reject(err);
                } else {
                    dataStream.on('data', (chunk) => {
                        buffer += chunk;
                    });
                    dataStream.on('end', () => {
                        resolve(buffer);
                    });
                    dataStream.on('error', (err) => {
                        reject(err);
                    });
                }
            })
        })
    }
}

export default MinioLoader;