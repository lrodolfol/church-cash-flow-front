import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChurchHadler } from 'src/app/handlers/churchHandler';
import { userHandler } from 'src/app/handlers/userHandler';
import { UserEditModel } from 'src/app/models/EditModels/user.mode';
import { ChurchReadModel } from 'src/app/models/ReadModels/ChurchRead.models';
import { UserReadModel } from 'src/app/models/ReadModels/UserRead.model';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { RegistersPageComponent } from 'src/app/pages/shared/registers-page/registers-page.component';
import { CloudService } from 'src/app/services/cloud.services';

@Component({
  selector: 'app-secretary-register-page',
  templateUrl: './secretary-register-page.component.html'
})
export class SecretaryRegisterPageComponent extends RegistersPageComponent implements OnInit {
  private passWord: string = "";

  protected churchs!: ResultViewModel['data'];
  protected formRegister!: FormGroup;
  protected formSearch!: FormGroup;
  protected churchToSelect!: [string, string][]
  protected codeFormSearch: string = "";
  protected RoleIdSelected: number[] = [];
  protected RoleToSelect!: [string, number][];
  private idSearch = "";
  protected UrlPreSigned: string = "";
  protected fileImage: File | null = null;

  constructor(private fbuilder: FormBuilder, private handler: userHandler, private churchHandler: ChurchHadler,
    private route: ActivatedRoute, private cloudService: CloudService) {
    super();
    this.formSearch = this.fbuilder.group({
      codeSearch: ['', Validators.compose([
        Validators.required
      ])],
    });
    this.formRegister = this.fbuilder.group({
      name: ['', Validators.compose([
        Validators.required
      ])],
      email: ['', Validators.compose([])],
      password: ['', Validators.compose([
        Validators.required
      ])],
      churchId: ['', Validators.compose([
        Validators.required
      ])],
      roleIds: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams
    .subscribe(params => {
      this.idSearch = params['id'];
    });

    this.clear();
    this.loadPosts();
    this.dashBoard();
    await this.getUrlPreSigned();
  }

  async getUrlPreSigned() {
    await this.handler.getUrlPreSigned()
      .then((result) => {
        this.UrlPreSigned = result;
      })
      .catch((error) => {
        this.msgErros.push("Falha ao buscar dados da página. Tente novamente");
      });
  }

  protected override clearForm(): void {
    this.formRegister.reset();
    this.formSearch.reset();
  }

  protected clear() {
    this.clearCommonObj();
    this.handler.clear();
    this.clearForm();
    this.typeSave = "create";
    this.RoleIdSelected = [];
    this.fileImage = null;
    this.getUrlPreSigned();
  }

  protected async save() {
    if (this.typeSave != "create") {
      this.msgErros.push("Não é possivel editar secretario. Exclua e crie um novo");
      return;
    }

    if (this.passWord !== this.formRegister.controls['password'].value) {
      this.msgErros.push("Senha inválida");
      return;
    }

    var userEdit = new UserEditModel();
    userEdit.name = this.formRegister.controls['name'].value;
    userEdit.email = this.formRegister.controls['email'].value;
    userEdit.churchId = (parseInt(this.formRegister.controls['churchId'].value));
    userEdit.roleIds = this.RoleIdSelected;
    userEdit.passwordHash = this.formRegister.controls['password'].value;

    var result = await this.handler.create(userEdit);
    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();

    if (this.fileImage) {
      await this.cloudService.uploadToS3(this.fileImage, this.UrlPreSigned);
    }

    this.handler.clear();
  }

  protected async dashBoard() {
    this.typeSave = "create";
    await this.loadChurchs();
  }

  private async loadChurchs() {
    try {
      const dados = await this.churchHandler.getChurchByPeriod(
        formatDate(new Date(1900, 1, 1), 'yyyy-MM-dd', 'en'),
        formatDate(new Date(), 'yyyy-MM-dd', 'en')
      );
      this.churchs = dados.data;

      var meuObjeto: Record<string, string> = {};
      this.churchs.forEach((x: ChurchReadModel) => {
        var key = x.name;
        var value = x.id;

        meuObjeto[key] = `${value}`;
      });

      this.churchToSelect = Object.entries(meuObjeto);

      if(this.idSearch != "" && this.idSearch.length > 0){
        this.typeSave = "update"
        this.search(this.idSearch);
        
        return;
      }
    } catch (error) {
      console.log('error to get churchs:', error);
    }
  }

  protected async search(codeSearch: string = "") {
    if(codeSearch == ""){
      this.codeFormSearch = this.formSearch.controls['codeSearch'].value;
    }else{
      this.codeFormSearch = codeSearch;
    }
    
    var result = await this.handler.getById(parseInt(this.codeFormSearch));
    this.fillForm(result.data)
    this.typeSave = "update";
  }

  private fillForm(user: UserReadModel) {
    console.log(this.RoleToSelect);
    console.log(user.userRoles[0] == "L-SCT");
    this.formRegister.controls['name'].setValue(user.name);
    this.formRegister.controls['churchId'].setValue(user.churchId);
    if (user.userRoles[0] == "L-SCT")
      this.formRegister.controls['roleIds'].setValue(1);
    if (user.userRoles[0] == "M-SCT")
      this.formRegister.controls['roleIds'].setValue(3);
    this.formRegister.controls['email'].setValue(user.email);
  }

  protected generatePassword() {
    this.passWord = "";
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=';
    for (let i = 0; i < 8; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      this.passWord += caracteres.charAt(indice);
    }

    this.formRegister.controls['password'].setValue(this.passWord);
  }

  private async loadPosts() {
    try {
      const meuObjeto: Record<string, number> = {};
      meuObjeto["Secretario local"] = 1;
      meuObjeto["Tesoureiro local"] = 2;
      meuObjeto["Secretario Ministerial"] = 3;
      meuObjeto["Tesoureiro Ministerial"] = 4;

      this.RoleToSelect = Object.entries(meuObjeto);

    } catch (error) {
      console.log('error to get Posts:', error);
    }
  }

  protected setPostId(idNumber: number) {
    var index = this.RoleIdSelected.indexOf(idNumber);
    if(index >= 0){
      var newListId = this.RoleIdSelected.filter(x => x !== idNumber);
      this.RoleIdSelected = newListId;
    }else{
      this.RoleIdSelected.push(idNumber);
    }
  }
}
