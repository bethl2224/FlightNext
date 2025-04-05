import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

// if no unique name is provided, the file upload will get updated
async function uploadFileToS3(file, fileName, folderPath = "") {
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
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`; // Reverting to use 'key' instead of 'params.key'
    console.log(imageUrl)
    return { fileName: fileName, imageUrl: imageUrl };
  } catch (error) {
    console.error("error in upload image to bucket", error);
    return null;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await uploadFileToS3(buffer, file.name);

    return NextResponse.json({
      success: true,
      filename: res.fileName,
      imageUrl: res.imageUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error uploading file" }, error);
  }
}
