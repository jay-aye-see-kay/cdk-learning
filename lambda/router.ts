import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { S3 } from "aws-sdk";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const { BUCKET_NAME } = process.env;
  if (!BUCKET_NAME) {
    return { statusCode: 500, body: "BUCKET_NAME missing from env" };
  }

  const Key = Math.random() > 0.5 ? "index.1.html" : "index.2.html";

  const s3 = new S3();
  const bucketContents = await s3
    .getObject({ Bucket: BUCKET_NAME, Key })
    .promise();

  return {
    statusCode: 200,
    headers: { "Content-Type": bucketContents.ContentType ?? "text/plain" },
    body: bucketContents.Body?.toString("utf-8") ?? "",
  };
}
