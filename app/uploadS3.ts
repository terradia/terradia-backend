import { S3 } from "aws-sdk";
import CompanyImageModel from "./database/models/company-image.model";
import * as path from "path";
import CompanyModel from "./database/models/company.model";
import ProductModel from "./database/models/product.model";
import ProductCompanyImageModel from "./database/models/product-company-images.model";
const md5 = require("md5");

interface UploadS3 {
  name: string;
  url: string;
  image: CompanyImageModel;
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
  productId: string | null,
  name?: string | undefined
): Promise<UploadS3> => {
  // random, so if two files have the same name, they will have a key different.
  const hash = md5(filename + Math.random() * 10000) + path.extname(filename);
  const response = await client
    .upload({
      Key: hash,
      ACL: "public-read",
      Body: stream,
      Bucket: process.env.__S3_BUCKET__ ? process.env.__S3_BUCKET__ : ""
    })
    .promise();
  const image = await CompanyImageModel.create({
    filename: hash,
    name: name ? name : hash,
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
  const newResource = await ProductCompanyImageModel.create({
    productId,
    companyImageId: image.id
  });
  await ProductModel.update(
    { coverId: newResource.id },
    { where: { id: productId } }
  );
};

export {
  uploadToS3SaveAsCompanyAvatarOrCover,
  uploadToS3SaveAsProductCover,
  uploadToS3,
  uploadToS3AsCompany
};
