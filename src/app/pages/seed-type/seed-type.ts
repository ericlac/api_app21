import {Component} from "@angular/core";
//EL import {ViewController, NavParams, IonicPage} from "@ionic/angular";
import {ModalController, NavParams} from "@ionic/angular";
import {Seeds} from "../../services/seeds";

/*@IonicPage()
@Component({
  templateUrl: 'seed-type.html'
})*/
export class SeedType {
  public type: string;

  constructor(public viewCtrl: ModalController, private params: NavParams) {
    this.type = params.get('type');
  }

  dismiss() {
    this.viewCtrl.dismiss({type: this.type});
  }

  selectType(newType): void {
    this.viewCtrl.dismiss({type: newType});
  }

  orderedSeeds(): any {
    return Seeds.ORDERED;
  }

  conceptSeed(): any {
    return Seeds.CONCEPT_TYPE;
  }
}
