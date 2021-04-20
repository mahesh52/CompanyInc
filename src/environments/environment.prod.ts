export const environment = {
  production: true,
  baseUrl: 'https://ec2-3-17-166-153.us-east-2.compute.amazonaws.com:9192/',
  baseUrl2:'https://ec2-3-17-166-153.us-east-2.compute.amazonaws.com:9192/',
  cognitoUrl: 'https://invoiceupload.auth.us-east-2.amazoncognito.com',
  redirectUri: 'http://invupload-gui.s3-website.us-east-2.amazonaws.com/register',
  amplify: {
    Auth: {
      identityPoolId: 'us-east-2:67cf00d5-e600-44f2-915b-54c424a4b826',
      region: 'us-east-2',
      userPoolId: 'us-east-2_Dk6dRsNU9',
      userPoolWebClientId: '5u6uobos0tjd5fs155ckq86hoi'
    }
  }
};
