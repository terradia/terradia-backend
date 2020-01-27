import { S3 } from 'aws-sdk'
import * as path from "path";

const client = new S3({
    accessKeyId: process.env.__S3_KEY__,
    secretAccessKey: process.env.__S3_SECRET__,
    params: { Bucket: process.env.__S3_BUCKET__ },
});

const uploadToS3 = async (hash: string, stream: Body): Promise<any> => {
    // const { stream, filename, mimetype, encoding } = file;

    console.log("Saving file");
    const response = await client
        .upload({
            Key: hash,
            ACL: 'public-read',
            Body: stream,
            Bucket: process.env.__S3_BUCKET__
        })
        .promise();
    return {
        name: hash,
        url: response.Location
    }
};

export default uploadToS3;