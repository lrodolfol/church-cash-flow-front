import { Component } from '@angular/core';
import { ModelToken } from 'src/app/models/churchEntitieModels/ModelToken.models';
import { AuthService } from 'src/app/services/auth.services';

@Component({
  selector: 'app-registers-page',
  templateUrl: './registers-page.component.html'
})
export abstract class RegistersPageComponent {
  protected auth: AuthService
  protected modelToken: ModelToken;

  public selectedFileExcel: File | undefined;
  private fileReader: FileReader | undefined;
  
  protected busy = false;
  protected searchBusy = false;
  protected hiddenImage = false;
  protected imageBusy : boolean = false;
  
  protected msgErros: string[] = [];
  protected msgSuccesss: string[] = [];
  protected msgImport: string = "";
  protected imageUrl : string = "";
  protected base64Image: string = "";
  protected typeSave = "create";

  constructor() {
    this.auth = new AuthService();
    this.modelToken = this.auth.getModelFromToken();    
  }
  
  protected abstract clearForm(): void;
  protected clearCommonObj(){
    this.hiddenImage = true;
    this.msgErros = [];
    this.msgSuccesss = [];
    this.msgImport = "";
    this.typeSave = "create";
    this.imageUrl = "";
  }

  protected setExcel(event: any): void {
    this.clearForm();
    this.selectedFileExcel = event.target.files[0];
  }

  protected showHideImage(){    
    this.hiddenImage = !this.hiddenImage; 
  }

  protected isNumeric(value: any): boolean {
    return !isNaN(value) && typeof value === 'number';
  }

}
