export const environment = {
  production: false,
  api: {
    host: 'http://localhost:7171/api'
  },
  cloudServices: {
    aws: {
      region: 'us-eats-1',
      bucketS3: {
        images: {
          name: 'church-manager-dev',
          url: 'https://church-manager-dev.s3.us-east-1.amazonaws.com/image',
          imageTypePattern: 'jpg',
          membersPath: 'members',
          offeringPath: 'offerings',
          tithesPath: 'tithes',
          firstFruitsPath: 'first-fruits',
          outflow: 'outflow'
        },
        monthWork: {
          url: 'https://churchmanager-uat.s3.us-east-1.amazonaws.com/month-work',
          fileTypePattern: 'pdf'
        }
      }
    }
  }
};
