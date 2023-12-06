import {ItemBucketMetadata} from 'minio';
import * as Minio from 'minio';
import MinioLoader, {IParamsMinio} from "./MinioLoader";

const params: IParamsMinio = {
    endPoint: 'dev-grups.sc.s3.dns-shop.ru',
    useSSL: false,
    accessKey: 'dev-grups',
    secretKey: 'LTEs9HZAsW2gwttSV4pCjHqbDFJZGnIeK2HzPPTOOVNqI2DES7JNPYQZSacqNV8n',
};


const file = './testfile.txt';
const folder = 'testfolder';

const metaData: ItemBucketMetadata = {
    'Content-Type': 'text/plain',
    'test-metadata': 'hello, world'
}

const minioLoader = new MinioLoader(params, 'test-bucket');

minioLoader.loadFile('testfile.txt', file, metaData, (err, res) => {
    if (err) {
        throw err;
    }
    console.log(res.etag, res.versionId);
} );

minioLoader.loadFolder('testfolder1', folder, metaData, (err, res) => {
    if (err) {
        throw err;
    }
    console.log(res.etag, res.versionId);
})
