import {Component, ViewChild} from '@angular/core';
//EL import {AlertController, App, Content, IonicPage, NavController, Platform, Slides} from '@ionic/angular';
import {AlertController, IonApp, IonContent, NavController, Platform, IonSlides} from '@ionic/angular';
import {ExplorerService} from "../../services/explorer.service";
import {GraphComponent} from "../../components/graph.component";
import {SeedsService} from "../../services/seeds.service";
import {AuthService} from "../../services/auth.service";
import {Seed} from "../../models/seed.model";
import {WheelComponent} from "../../components/wheel.component";
import {InAppBrowser} from "@ionic-native/in-app-browser";

/*EL @IonicPage({
  segment: 'explorer'
})
*/
@Component({
  templateUrl: 'explorer.html'
})
export class ExplorerPage {
//EL  @ViewChild('viewSlides') viewSlides: Slides;
  @ViewChild('viewSlides') viewSlides: IonSlides;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(WheelComponent) wheel: WheelComponent;
  @ViewChild(GraphComponent) graph: GraphComponent;

  public loading: boolean;
  public authorName;
  public authorId;

  private refresh: boolean;

  constructor(public explorerService: ExplorerService, public dataService: SeedsService,
              public authService: AuthService, private navCtrl: NavController, private platform: Platform,
 //EL             private alertCtrl: AlertController, private app: App, private iab: InAppBrowser) {
              private alertCtrl: AlertController, private app: IonApp, private iab: typeof InAppBrowser) {
    this.loading = true;
    this.refresh = false;
  }

  rootNodeChange(event): void {
    this.navigateTo(event.newRoot);
  }

  updateView(event): void {
    let duration = 750;
    this.viewSlides.lockSwipes(false);
    if(event.current == 1) {
      event.selected == 2 ? this.viewSlides.slideTo(2, duration) : this.viewSlides.slideNext(duration);
    } else if(event.current == 2) {
      event.selected == 1 ? this.viewSlides.slideTo(0, duration) : this.viewSlides.slidePrev(duration);
    } else {
      event.selected == 1 ? this.viewSlides.slidePrev(duration) : this.viewSlides.slideNext(duration);
    }
    this.viewSlides.lockSwipes(true);
  }

  ionViewDidEnter(): void {
    if(!this.authService.userSeed) {
      this.dataService.getCurrentUserSeed().then((userSeed) => {
        if(userSeed) {
          this.authService.userSeed = userSeed;
        }
      });
    }

    this.registerBack();
    if(!this.explorerService.rootNode) {
      this.explorerService.navigateTo(null, () => this.updateViews());
    } else {
      this.updateViews();
    }
    this.viewSlides.lockSwipes(true);
  }

  wheelSwipe(evt) {
    // Left to right
    if(evt.direction == '4') {
      this.wheel.translateNext();
    }
    // Right to left
    else if(evt.direction == '2') {
      this.wheel.translatePrev();
    }
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, () => {
      this.updateViews();
    });
  }

  navigateForward(): void {
    this.explorerService.navigateForward(() => {
      this.updateViews();
    });
  }

  navigateBackward(): void {
    this.explorerService.navigateBackward(() => {
      this.updateViews();
    });
  }

  displayDetails() {
    this.wheel.translateNext();
  }

  editSeed(): void {
    this.refresh = true;
      //EL unresolved ?? cause du passage de param??tres
    this.navCtrl.navigateForward('FormPage', {id: this.explorerService.rootNode.id, node: this.explorerService.rootNode});
  }

  shareSeed(): void {
    //EL unresolved ?? cause du passage de param??tre
    this.navCtrl.navigateForward('SharePage', {id: this.explorerService.rootNode.id});
  }

  updateViews() {
    if(this.graph) {
  //EL    this.content.resize();
      this.graph.render(this.explorerService.networkData.nodes, this.explorerService.networkData.edges, this.refresh);
      this.loading = false;
      this.refresh = false;
    }
    if(this.wheel) {
      this.wheel.render(this.explorerService.rootNode);
    }
    this.loadAuthor();
  }

  displaySearch() {
    this.navCtrl.navigateForward('SearchPage');
  }

  loadAuthor() {
    if(this.explorerService.rootNode.author) {
      this.dataService.getUsersSeeds([this.explorerService.rootNode.author]).then((seeds) => {
        let userSeed = seeds[this.explorerService.rootNode.author];
        if(userSeed) {
          this.authorName = userSeed.label;
          this.authorId = userSeed. id;
        }
      });
    } else {
      this.authorName = null;
      this.authorId = null;
    }
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getUTCDate()), this.lpad(dateObj.getUTCMonth() + 1), dateObj.getUTCFullYear()].join('/');
    }
    return '';
  }

  lpad(d): string {
    return d < 10 ? ('0' + d) : d;
  }

 async logOut() {
    let confirm = this.alertCtrl.create({
      header: 'D??connexion',
      message: 'Souhaitez-vous vous d??connecter ?',
      buttons: [
        {text: 'Non', handler: () => {}},
        {
          text: 'Oui',
          handler: () => {
            this.dataService.cancelReplication();
            this.authService.logOut().then(() => {
              this.explorerService.initData();
//EL unresolved!!!             this.app.getRootNav().setRoot('LoginPage');
              this.app.getRootNav().setRoot('LoginPage');
            });
          }
        }
      ]
    });
    (await confirm).present();
  }

  openUrl(url): void {
    this.iab.create(Seed.formattedUrl(url).link, '_system');
  }

  openAddress(address) {
    this.iab.create('https://maps.google.com?q=' + address, '_blank', 'location=yes');
  }

  linkIcon(url): string {
    return Seed.formattedUrl(url).icon;
  }

  linkLabel(url): string {
    return Seed.trimmed(url);
  }

  displayHistory() {
    this.navCtrl.navigateForward('HistoryPage');
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        } else {
          this.explorerService.navigateBackward(() => this.updateViews());
        }
      }, 100);
    });
  }
}
