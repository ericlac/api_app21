import {Component} from "@angular/core";
//EL import {ViewController, IonicPage} from "@ionic/angular";
import {ModalController} from "@ionic/angular";

/*EL @IonicPage({
  segment: 'conditions_generales'
})
*/
@Component({
  templateUrl: 'terms.html'
})
export class Terms {
  public type: string;

//EL  constructor(public viewCtrl: ViewController) {
    constructor(public viewCtrl: ModalController) {
  }

  dismiss(accept) {
    this.viewCtrl.dismiss({accept: accept});
  }
}
