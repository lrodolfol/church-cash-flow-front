import { MemberInEditModel } from "./MemberInEdit.models";
import { MemberOutEditDto } from "./MemberOutEdit.models";

export class MemberEditModel {
    name: string = "";
    description: string = "";
    base64Image: string = "";
    dateBirth: string = "";
    dateBaptism: string = "";
    dateRegister: string = "";;
    churchId: number = 0;
    postIds: number[] = [];
    active: boolean = true;
    editMemberInDto?: MemberInEditModel | null;
    editMemberOutDto?: MemberOutEditDto | null;
}