import { Injectable } from "@angular/core";
import { configAplication } from "../config/configAplication";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
  })
  
export class CloudService {
    
    constructor(private http: HttpClient = null as any) {
    }

    public async getUrlImageMembersStorage(imageName:string) : Promise<string> {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var path = configAplication.getObjCloudConfig().aws.bucketS3.images.membersPath;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;

        return url;
    }

    public getUrlImageOfferingsStorage(imageName:string) : string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var path = configAplication.getObjCloudConfig().aws.bucketS3.images.offeringPath;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;

        return url;
    }

    public getUrlImageTithesStorage(imageName:string) : string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var path = configAplication.getObjCloudConfig().aws.bucketS3.images.tithesPath;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;

        return url;
    }

    public getImageStore(path:string, imageName:string) : string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;
                
        //console.log(`${urlBucket}/${path}/${imageName}.${extensionImage}`);
        console.log(url);   
        return `${urlBucket}/${path}/${imageName}.${extensionImage}`;

    }

    getUrlImageFirstFruitsStorage(imageName: string): string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var path = configAplication.getObjCloudConfig().aws.bucketS3.images.firstFruitsPath;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;

        return url;
    }

    getUrlImageOutFlowStorage(imageName: string): string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.images.url;
        var path = configAplication.getObjCloudConfig().aws.bucketS3.images.outflow;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.images.imageTypePattern;
        var url = `${urlBucket}/${path}/${imageName}.${extensionImage}`;

        return url;
    }

    public getUrlImageMonthWorkStorage(competence:string, churchId:number) : string {
        var urlBucket = configAplication.getObjCloudConfig().aws.bucketS3.monthWork.url;
        var extensionImage = configAplication.getObjCloudConfig().aws.bucketS3.monthWork.fileTypePattern;
        var url = `${urlBucket}/${churchId}.${competence}.${extensionImage}`;

        return url;
    }

    public async uploadToS3(file: File, presignedUrl: string): Promise<void> {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });

        if (!response.ok) {
            console.error('Erro no upload', response.status, response.statusText);
            throw new Error(`Upload falhou: ${response.status}`);
        }

        console.log('Upload realizado com sucesso');
    }
}