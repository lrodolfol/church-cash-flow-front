import { EntitieResultApi } from "../churchEntitieModels/Entitie.models";

export class CloseMonthlyEdit extends EntitieResultApi {
    public YearMonth: number = 0;
    public Block: boolean = true;
    public ChurchId: number = 0;
}
  