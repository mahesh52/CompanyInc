// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
//  baseUrl: 'https://hapeservices.azurewebsites.net/',
  baseUrl: 'https://ec2-18-188-70-182.us-east-2.compute.amazonaws.com:9192/',
  baseUrl2:'https://ec2-18-188-70-182.us-east-2.compute.amazonaws.com:9192/',
  cognitoUrl: 'https://invoiceupload.auth.us-east-2.amazoncognito.com',
  redirectUri: 'http://localhost:4200/register',
  amplify: {
    Auth: {
      identityPoolId: 'us-east-2:67cf00d5-e600-44f2-915b-54c424a4b826',
      region: 'us-east-2',
      userPoolId: 'us-east-2_Dk6dRsNU9',
      userPoolWebClientId: '5u6uobos0tjd5fs155ckq86hoi'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
