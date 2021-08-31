import {Component} from "@angular/core";
//EL import {ViewController, IonicPage, NavController} from "@ionic/angular";
import {PopoverController, NavController} from "@ionic/angular";
import {ExplorerService} from "../../services/explorer.service";
import {SeedsService} from "../../services/seeds.service";
import {Seed} from "../../models/seed.model";
import {TrackingService} from "../../services/tracking.service";

//EL @IonicPage()
@Component({
  templateUrl: 'history.html'
})
export class HistoryPage {

  public history: Array<Seed>;

//EL  constructor(public viewCtrl: ViewController, private navCtrl: NavController, private seedsService: SeedsService,
  constructor(public viewCtrl: PopoverController, private navCtrl: NavController, private seedsService: SeedsService,
      private explorerService: ExplorerService, private tracker: TrackingService) {
    this.history = [];
  }

  ionViewDidEnter() {
    this.seedsService.getNodes(this.explorerService.history()).then((seeds) => {
      this.history = seeds;
    });
    this.tracker.trackView('Historique');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  navigateTo(node): void {
 //EL   this.explorerService.navigateTo(node, () => {this.navCtrl.popToRoot();});
    this.explorerService.navigateTo(node, () => {this.navCtrl.navigateRoot('');});
  }
}
