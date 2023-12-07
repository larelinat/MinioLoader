import MinioLoader, {IParamsMinio} from "./MinioLoader";
// @ts-ignore
import express from 'express';

const params: IParamsMinio = {
    endPoint: 'dev-grups.sc.s3.dns-shop.ru',
    useSSL: false,
    accessKey: 'dev-grups',
    secretKey: 'LTEs9HZAsW2gwttSV4pCjHqbDFJZGnIeK2HzPPTOOVNqI2DES7JNPYQZSacqNV8n',
};

const minioLoader = new MinioLoader(params, 'test-bucket');


const app = express();
const port = 5000;

app.get('/', (req, res) => {
    const fileName = req.query.fileName?.toString();
    fileName
        ? minioLoader.getObject(fileName).then((obj) => {
            res.send(obj);
        })
        : res.send('Error! No file name.');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})