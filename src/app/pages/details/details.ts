import {Component, ViewChild, NgZone} from '@angular/core';
//EL: import {App, NavParams, Events, NavController, Content, AlertController, Platform, IonicPage} from '@ionic/angular';
import {IonApp, NavParams, Events, NavController, IonContent, AlertController, Platform} from '@ionic/angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExplorerService} from "../../services/explorer.service";
import {AuthService} from "../../services/auth.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {SeedsService} from "../../services/seeds.service";

/*EL @IonicPage({
  segment: 'details/:id'
})
*/
@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(IonContent) content: IonContent;

  public authorName;
  public authorId;

//EL  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
  constructor(private app: IonApp, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public authService: AuthService,
              public alertCtrl: AlertController, public dataService: SeedsService, private navParams: NavParams,
//EL              private iab: InAppBrowser, private zone: NgZone, private platform: Platform) {
              private iab: typeof InAppBrowser, private zone: NgZone, private platform: Platform) {
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
    let seedId = this.navParams.get('id');
    if(seedId) {
      this.explorerService.navigateTo(seedId, () => {
        this.loadAuthor();
      });
    } else {
      this.loadAuthor();
    }
  }

  loadAuthor() {
    if(this.explorerService.rootNode.author) {
      this.dataService.getUsersSeeds([this.explorerService.rootNode.author]).then((seeds) => {
        let userSeed = seeds[this.explorerService.rootNode.author];
        if(userSeed) {
          this.authorName = userSeed.label;
          this.authorId = userSeed.id;
          console.log('authorId: ' + this.authorId);
        }
      });
    } else {
      this.authorName = null;
      this.authorId = null;
      console.log('authorId: ' + this.authorId);
    }
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    this.iab.create(url, '_system');
  }

  openAddress(address) {
    this.iab.create('https://maps.google.com?q=' + address, '_blank', 'location=yes');
  }

  navigateTo(node, showGraph): void {
    if(showGraph) {
      this.explorerService.navigateTo(node, () => {
        this.navCtrl.pop();
      });
    } else {
      this.explorerService.navigateTo(node, () => {
 //EL:       this.content.resize()
      });
    }
  }

  displaySearch() {
 //EL   this.navCtrl.push('SearchPage');
    this.navCtrl.navigateForward('SearchPage');
  }

  shareSeed() {
//EL    this.navCtrl.push('SharePage', {id: this.explorerService.rootNode.id});
    this.navCtrl.navigateForward('SharePage', {id: this.explorerService.rootNode.id});
  }

  editSeed(): void {
//EL    this.navCtrl.push('FormPage', {id: this.explorerService.rootNode.id, node: this.explorerService.rootNode});
//non encore résolu car 2 paramètres : utiliser extra state ?
    this.navCtrl.navigateForward('FormPage', {id: this.explorerService.rootNode.id, node: this.explorerService.rootNode});
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
      header: 'Déconnexion',
      message: 'Souhaitez-vous vous déconnecter ?',
      buttons: [
        {text: 'Non', handler: () => {}},
        {
          text: 'Oui',
          handler: () => {
            this.dataService.cancelReplication();
            this.authService.logOut().then(() => {
              this.explorerService.initData();
              this.zone.run(() => {
//EL unresolved     this.app.getRootNav().setRoot('LoginPage');
                this.app.getRootNav().setRoot('LoginPage');
              });
            });
          }
        }
      ]
    });
    (await confirm).present();
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
      }, 100);
    });
  }

  closeDetails() {
    this.navCtrl.pop();
  }
}
