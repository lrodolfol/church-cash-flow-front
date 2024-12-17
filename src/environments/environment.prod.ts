export const environment = {
  production: true,
  api: {
    host: 'https://churchmanager.azurewebsites.net/api'
  },
  cloudServices: {
    aws: {
      region: 'us-eats-1',
      bucketS3: {
        images: {
          name: 'church-manager-prd',
          url: 'https://church-manager-dev.s3.us-east-1.amazonaws.com/image',
          imageTypePattern: 'jpg',
          membersPath: 'members',
          offeringPath: 'offerings',
          tithesPath: 'tithes',
          firstFruitsPath: 'first-fruits',
          outflow: 'outflow'
        },
        monthWork: {
          url: 'https://churchmanager-dev.s3.us-east-1.amazonaws.com/month-work',
          fileTypePattern: 'pdf'
        }
      }
    }
  }
};
