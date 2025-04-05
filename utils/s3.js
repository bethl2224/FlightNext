import { S3Client, PutObjectCommand,  DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export const s3Client_HOTEL = new S3Client({
  region: process.env.S3_REGION_HOTEL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID_HOTEL,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY_HOTEL,
  },
});

// if no unique name is provided, the file upload will get updated
export async function uploadFileToS3(file, fileName, folderPath = "") {
  const fileBuffer = file;
  let key = `${fileName}-${Date.now()}`;
  if (folderPath) {
    key = `${folderPath}/${key}`;
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/jpg",
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
    return { fileName: fileName, imageUrl: imageUrl };
  } catch (error) {
    console.error("error in upload image to bucket", error);
    return null;
  }
}


export async function deleteFileFromS3(folderPath, key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${folderPath}/${key}`, // Construct the full key
  };

  const command = new DeleteObjectCommand(params);
  try {
    await s3Client.send(command);
    console.log(`File deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file: ${key}`, error);
    return false;
  }
}


export async function process_img(files, addImgS3, folderPath = "") {
  try {
    const imgs = [];
    // handle single file
    if (!Array.isArray(files)) {
      files = [files];
    }
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await addImgS3(buffer, file.name, folderPath);
      imgs.push(res);
    }
    return imgs;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function uploadFileToS3Hotel(file, fileName, folderPath = "") {
  const fileBuffer = file;
  let key = `${fileName}-${Date.now()}`;
  if (folderPath) {
    key = `${folderPath}/${key}`;
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME_HOTEL,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/jpg",
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client_HOTEL.send(command);
    const imageUrl = `https://${process.env.S3_BUCKET_NAME_HOTEL}.s3.${process.env.S3_REGION_HOTEL}.amazonaws.com/${key}`;
    return { fileName: fileName, imageUrl: imageUrl };
  } catch (error) {
    console.error("error in upload image to bucket", error);
    return null;
  }
}
