import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PostHandler } from 'src/app/handlers/PostHandler';
import { MemberHandler } from 'src/app/handlers/memberHandler';
import { MemberEditModel } from 'src/app/models/EditModels/MemberEdit.models';
import { MemberOutEditDto } from 'src/app/models/EditModels/MemberOutEdit.models';
import { MemberReadModel } from 'src/app/models/ReadModels/MemberRead.models';
import { PostReadModel } from 'src/app/models/ReadModels/PostRead.models';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { CloudService } from 'src/app/services/cloud.services';
import { ImageMethods } from 'src/app/utils/ImagesMethods.utils';

@Component({
  selector: 'app-member-register-page',
  templateUrl: './member-register-page.component.html'
})
export class MemberRegisterPageComponent implements OnInit {

  private post!: ResultViewModel['data'];

  private MemberId: string = "";
  protected PostIdSelected: number[] = [];
  protected filebusy: boolean = false;
  protected typeSave = "create";
  protected formMember!: FormGroup;
  protected formMemberOut!: FormGroup;
  protected formMemberIn!: FormGroup;
  protected formSearch!: FormGroup;
  protected postToSelect!: [string, string][];
  protected msgErros: string[] = [];
  protected msgSuccesss: string[] = [];
  protected searchBusy: boolean = false;
  protected memberIsValid: boolean = false;
  protected base64Image: string = "";
  protected memberPhotoUrl: string = "";
  protected codeSearch: string = "";
  protected UrlPreSigned: string = "";
  protected fileImage: File | null = null;

  constructor(private fbuilder: FormBuilder, private handler: MemberHandler, private postHandler: PostHandler,
    private cloudService: CloudService, private route: ActivatedRoute) {
    this.formMember = this.fbuilder.group({
      name: ['', Validators.compose([
        Validators.required, ,
      ])],
      dateBirth: ['', Validators.compose([
        Validators.required,
      ])],
      description: ['', Validators.compose([
        Validators.maxLength(100),
      ])],
      photo: ['', Validators.compose([
      ])],
      dateRegister: ['', Validators.compose([
        Validators.required,
      ])],
      dateBaptism: ['', Validators.compose([
      ])],
      posts: []
    });

    this.formSearch = this.fbuilder.group({
      code: ['', Validators.compose([
        Validators.required
      ])],
    });

    this.formMemberOut = this.fbuilder.group({
      reason: ['', Validators.compose([
        Validators.required,
      ])],
      day: ['', Validators.compose([
        Validators.required
      ])]
    });

    this.formMemberIn = this.fbuilder.group({
      churchName: ['', Validators.compose([
      ])],
      lastPost: ['', Validators.compose([
      ])],
      letterReceiver: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  async ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.codeSearch = params['id'];
      });

    await this.dashBoard();
    await this.getUrlPreSigned();
  }

  async dashBoard() {
    await this.clear();
    await this.loadPosts();

    if (this.codeSearch != "" && !this.codeSearch == undefined) {
      this.typeSave = "update"
      this.searchByCode(this.codeSearch);
    }
  }

  async getUrlPreSigned() {
    await this.handler.getUrlPreSigned()
      .then((result) => {
        this.UrlPreSigned = result;
        //console.log("Url pre signed: ", this.UrlPreSigned);
      })
      .catch((error) => {
        this.msgErros.push("Falha ao buscar dados da página. Tente novamente");
      });
  }


  async searchByCode(code: string = "") {
    this.searchBusy = true;

    if (code.length <= 0)
      code = this.formSearch.value.code;

    var modelToForm: ResultViewModel = await this.handler.getByCode(code);

    this.clear();

    if (modelToForm.errors!.length > 0) {
      this.searchBusy = false;
      this.msgErros.push("Member not found");
      return;
    }

    this.typeSave = "update";
    var objModel: MemberReadModel = modelToForm.data;

    this.fillFormWithModel(objModel, code);

    this.memberIsValid = objModel.active;
    this.searchBusy = false;
    this.typeSave = "update";
    this.formSearch.controls['code'].setValue(code);
  }

  private async fillFormWithModel(model: MemberReadModel, code: string) {
    this.MemberId = model.id.toString();

    if (model.photo != null && model.photo.length > 5) {
      this.filebusy = true;
      this.memberPhotoUrl = await this.cloudService.getUrlImageMembersStorage("members_"+model.photo);
      this.filebusy = false;
    }

    this.formMember.controls['dateBirth'].setValue(formatDate(model.dateBirth, 'yyyy-MM-dd', 'en'));
    this.formMember.controls['dateRegister'].setValue(formatDate(model.dateRegister, 'yyyy-MM-dd', 'en'));
    this.formMember.controls['dateBaptism'].setValue(formatDate(model.dateBaptism, 'yyyy-MM-dd', 'en'));
    this.formMember.controls['name'].setValue(model.name);
    this.formMember.controls['description'].setValue(model.description);

    if (model.memberIn !== null) {
      this.formMemberIn.controls['letterReceiver'].setValue(model.memberIn!.letterReceiver.toLowerCase().trim() == "com carta" ? 1 : 2);
      this.formMemberIn.controls['lastPost'].setValue(model.memberIn!.lastPost);
      this.formMemberIn.controls['churchName'].setValue(model.memberIn!.churchName);
    }

    if (model.memberOut !== null) {
      var idReason = 1;
      if (model.memberOut!.reason.toString().trim() == "solicitação") {
        idReason = 2;
      } else if (model.memberOut!.reason.toString().trim() == "falecimento") {
        idReason = 3;
      }
      this.formMemberOut.controls['reason'].setValue(idReason);
      this.formMemberOut.controls['day'].setValue(model.memberOut!.day)
    }

    if (model.memberPost.length > 0) {
      model.memberPost.forEach(x => {
        this.PostIdSelected.push(x.id);
      })
    }

  }

  protected async loadPosts() {
    try {
      const dados = await this.postHandler.getPosts();
      this.post = dados.data;
      const meuObjeto: Record<string, string> = {};

      this.post.forEach((x: PostReadModel) => {

        var key = x.name;
        var value = x.id

        meuObjeto[key] = `${value}`;
      });

      this.postToSelect = Object.entries(meuObjeto);

    } catch (error) {
      console.log('error to get Posts:', error);
    }
  }

  protected setPostId(id: string) {
    var idNumber: number = 0;
    try {
      idNumber = parseInt(id);
    } catch {
      console.log("Cannot converter the id for number. The value is invalid");
    }

    var index = this.PostIdSelected.indexOf(idNumber);
    if (index >= 0) {
      var newListId = this.PostIdSelected.filter(x => x !== idNumber);
      this.PostIdSelected = newListId;
    } else {
      this.PostIdSelected.push(idNumber);
    }
  }

  protected clear(): void {
    this.msgErros = [];
    this.msgSuccesss = [];
    this.PostIdSelected = [];
    this.handler.clear();
    this.formMember.reset();
    this.formSearch.reset();
    this.formMemberIn.reset();
    this.formMemberOut.reset();
    this.typeSave = "create";
    this.MemberId = "";
    this.base64Image = "";
    this.fileImage = null;

    this.memberPhotoUrl = this.cloudService.getImageStore("common", "anonymou-user");
    this.getUrlPreSigned();
  }

  protected loadImage(event: any) {
    this.msgErros = [];
    this.msgSuccesss = [];

    this.fileImage = event.target.files[0];

    // var imageMethod = new ImageMethods(2 * 1024 * 1024,);
    // var base64 = imageMethod.convertToBase64(file)
    //   .then((base64) => {
    //     if (base64 == "") {
    //       this.formMember.controls["photo"].setValue(null);
    //       this.msgErros.push(imageMethod.getErro())
    //     } else {
    //       this.base64Image = base64;
    //     }

    //   })
    //   .catch((erro) => {
    //     console.log("Erro no carregamento da imagem");
    //     this.formMember.controls["photo"].setValue(null);
    //     this.msgErros.push(imageMethod.getErro())
    //   });
  }

  protected async save() {
    this.msgErros = [];
    this.msgSuccesss = [];
    
    if (this.formMember.invalid) {
      if (this.formMember.controls['name'].invalid)
        this.msgErros.push("Nome completo é obrigatório");
      if (this.formMember.controls['dateBirth'].invalid)
        this.msgErros.push("Data de nascimento é obrigatória");
      if (this.formMember.controls['dateRegister'].invalid)
        this.msgErros.push("Data de cadastro é obrigatória");
      return;
    }

    this.searchBusy = true;

    var member: MemberEditModel = this.formMember.value;
    member.base64Image = this.base64Image;

    if (member.dateBaptism.length <= 0) {
      member.dateBaptism = "0001-01-01"
    }
    member.postIds = this.PostIdSelected;

    member.editMemberInDto = null;
    member.editMemberOutDto = null;

    if (this.formMemberIn.valid) {
      var memberEditDto = this.formMemberIn.value;
      memberEditDto.letterReceiver = this.getLetterReceiverMemberIn(memberEditDto.letterReceiver.toString());
      member.editMemberInDto = memberEditDto;
    }

    if (this.formMemberOut.valid) {
      var formOut = this.formMemberOut.value;
      var memberOutEditDto = new MemberOutEditDto(this.getReasonMemberOut(formOut.reason.toString()), formOut.day);
      member.editMemberOutDto = memberOutEditDto;
    }

    member.Photo = this.UrlPreSigned;
    if (this.typeSave == "create") {
      await this.create(member);
    } else if (this.typeSave == "update") {
      await this.update(member);
    }
    if (this.fileImage) {
      await this.cloudService.uploadToS3(this.fileImage, this.UrlPreSigned);
    }
    
    this.searchBusy = false;
  }

  private async create(model: MemberEditModel) {
    await this.handler.create(model)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro no cadastro. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  private async update(model: MemberEditModel) {
    await this.handler.update(model, this.MemberId)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro no cadastro. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  tryParseInt(number: string): number {
    return parseInt(number);
  }

  private getReasonMemberOut(id: string): string {
    if (id == "1") return "abandono";
    if (id == "2") return "solicitação";
    if (id == "3") return "falecimento";
    return "";
  }

  private getLetterReceiverMemberIn(id: string): string {
    if (id === '1') return "com carta";
    if (id === '2') return "sem carta";
    return "";
  }
}
