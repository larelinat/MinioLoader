#!/usr/bin/env node

import {Command} from 'commander';
import * as fs from 'fs';
import MinioLoader, {IParamsMinio} from "./MinioLoader";
import * as path from "path";


interface IDataForLoader {
    entry: IParamsMinio;
    name: string;
    directory?: string;
    file?: string;
    bucketName: string;
}

let data: IDataForLoader;

const program = new Command();

program
    .option('-e, --entry <entry>', 'load file with credentials')
    .option('-d, --directory <dirpath>', 'load directory')
    .option('-f, --file <filepath>', 'load file')
    .option('-n, --name <name>', 'name of file or folder in bucket')
    .parse(process.argv);

const options = program.opts();

if(!options.entry) {
    console.log('Error! No entry');
    throw Error('No entry');
}
if(options.directory && options.file) {
    console.log('Error! Only one of directory or file');
    throw Error('Only one of directory or file');
}
if(!options.directory && !options.file) {
    console.log('Error! No file or directory');
    throw Error('No file or directory');
}
if(!options.name) {
    console.log('No name, using default');
}

let entryData = JSON.parse((fs.readFileSync(options.entry, 'utf-8')));

data = {
    entry: {
        endPoint: entryData.endPoint,
        accessKey: entryData.accessKey,
        secretKey: entryData.secretKey,
        useSSL: entryData.useSSL
    },
    name:
        options.name ||
        options.file && path.basename(options.file) ||
        options.directory && path.basename(options.directory),
    directory: options.directory,
    file: options.file,
    bucketName: entryData.bucketName
}

const minioLoader = new MinioLoader(data.entry, data.bucketName);

if(options.file && data.file) {
    minioLoader.loadFile(data.name, data.file, {}, () => {});
} else if(options.directory && data.directory) {
    minioLoader.loadFolder(data.name, data.directory, {}, () => {});
}
console.log('Ready!');

