//import configData from './settings/settings-prd.json';
import { environment } from '../../environments/environment';

export class configAplication {
  private static config: any;

  static loadConfig() {
    var obj : any = environment;
  }

  static getConfig() {
    return configAplication.config;
  }

  static getApiHosy() {
    return environment.api.host;
  }

  static getObjCloudConfig(){
    return environment.cloudServices;
  }
}
