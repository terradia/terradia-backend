import { S3 } from "aws-sdk";
import CompanyImagesModel from "./database/models/company-images.model";
import * as path from "path";
import CompanyModel from "./database/models/company.model";
import ProductModel from "./database/models/product.model";
const md5 = require("md5");

interface UploadS3 {
  name: string;
  url: string;
  image: CompanyImagesModel;
}
const client = new S3({
  accessKeyId: process.env.__S3_KEY__,
  secretAccessKey: process.env.__S3_SECRET__,
  params: { Bucket: process.env.__S3_BUCKET__ }
});

const uploadToS3 = async (
  filename: string,
  stream: Body
): Promise<{ name: string; url: string }> => {
  const hash = md5(filename) + path.extname(filename);
  const response = await client
    .upload({
      Key: hash,
      ACL: "public-read",
      Body: stream,
      Bucket: process.env.__S3_BUCKET__ ? process.env.__S3_BUCKET__ : ""
    })
    .promise();

  return {
    name: hash,
    url: response.Location
  };
};

const uploadToS3AsCompany = async (
  filename: string,
  stream: Body,
  companyId: string,
  productId: string | null
): Promise<UploadS3> => {
  const hash = md5(filename) + path.extname(filename);
  const response = await client
    .upload({
      Key: hash,
      ACL: "public-read",
      Body: stream,
      Bucket: process.env.__S3_BUCKET__ ? process.env.__S3_BUCKET__ : ""
    })
    .promise();
  const image = await CompanyImagesModel.create({
    filename: hash,
    companyId,
    productId
  });
  return {
    name: hash,
    url: response.Location,
    image
  };
};

const uploadToS3SaveAsCompanyAvatarOrCover = async (
  filename: string,
  stream: Body,
  companyId: string,
  islogo: boolean
): Promise<void> => {
  const { image } = await uploadToS3AsCompany(
    filename,
    stream,
    companyId,
    null
  );
  const update = islogo ? { logoId: image.id } : { coverId: image.id };
  CompanyModel.update(update, { where: { id: companyId } });
};

const uploadToS3SaveAsProductCover = async (
  filename: string,
  stream: Body,
  companyId: string,
  productId: string
): Promise<void> => {
  const { image } = await uploadToS3AsCompany(
    filename,
    stream,
    companyId,
    null
  );
  ProductModel.update({ coverId: image }, { where: { id: productId } });
};

export {
  uploadToS3SaveAsCompanyAvatarOrCover,
  uploadToS3SaveAsProductCover,
  uploadToS3
};
