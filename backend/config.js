module.exports = {
  aws_remote_config: {
    accessKeyId: 'AKIA5FEQSMXMRE7U4PDD',
    secretAccessKey: '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',
    region: 'us-east-1',
  },
};
var AWS = require('aws-sdk');
var myCredentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId:'us-east-1:identity-pool-id'
}); 
var myConfig = new AWS.Config({
    credentials: myCredentials, region: 'us-east-1'
});
AWS.config = myConfig
AWS.config.update({region: 'us-east-1'});