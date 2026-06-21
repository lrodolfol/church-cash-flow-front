export const environment = {
    production: false,
    api: {
      host: 'http://localhost:8181/api'
    },
    cloudServices: {
      aws: {
        region: 'us-eats-1',
        bucketS3: {
          images: {
            name: 'churchmanager-dev',
            url: 'https://church-manager-dev.s3.us-east-1.amazonaws.com/images',
            imageTypePattern: 'jpg',
            alternativeImageTypePattern: 'png',            
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
  