import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import {
  HttpLambdaIntegration,
  HttpUrlIntegration,
} from "@aws-cdk/aws-apigatewayv2-integrations";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";

export class LearningStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const httpApi = new apigw.HttpApi(this, "JackRoseLearningHttpApi");

    // setup and deploy and simple lambda
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });
    const helloFnIntegration = new HttpLambdaIntegration(
      "HelloFnIntegration",
      hello
    );
    httpApi.addRoutes({
      path: "/hello",
      methods: [apigw.HttpMethod.GET],
      integration: helloFnIntegration,
    });

    // create a bucket, sync its files with local `static` directory, then point a route to `index.html`
    // this probably isn't something many sites would do, but it's similar to one of our projects so worth practicing
    const bucket = new s3.Bucket(this, "JackRoseLearningBucket", {
      bucketName: "jack-rose-learning-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true, // TODO how do I just grant access to the httpApi?
    });
    new s3Deploy.BucketDeployment(this, "DeployFiles", {
      sources: [s3Deploy.Source.asset("./static")],
      destinationBucket: bucket,
    });
    const bucketIntegration = new HttpUrlIntegration(
      "BucketIntegration",
      bucket.urlForObject("index.html")
    );
    httpApi.addRoutes({
      path: "/",
      methods: [apigw.HttpMethod.GET],
      integration: bucketIntegration,
    });
  }
}
