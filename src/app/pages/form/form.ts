import {Component, ViewChild} from '@angular/core';
//import {NavParams, NavController, ModalController, ToastController, LoadingController, IonicPage} from '@ionic/angular';
import {NavParams, NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {Seed} from "../../models/seed.model";
import {ExplorerService} from "../../services/explorer.service";
import {SeedsService} from "../../services/seeds.service";
import {SeedType} from "../seed-type/seed-type";
import {InternalLinksPage} from "../internal-links/internal-links";
import {EditAvatar} from "../edit-avatar/edit-avatar";
import {Seeds} from "../../services/seeds";
import {AuthService} from "../../services/auth.service";
import {TrackingService} from "../../services/tracking.service";

/*EL @IonicPage({
  segment: 'edition'
})
*/
@Component({
  templateUrl: 'form.html'
})
export class FormPage {
  @ViewChild('startDate') startDatePicker;
  @ViewChild('endDate') endDatePicker;

  public node: Seed;
  public disabled: boolean;

  constructor(private navCtrl: NavController, private params: NavParams, public modalCtrl: ModalController,
              private authService: AuthService, public dataService: SeedsService, private explorerService: ExplorerService,
              private loadingCtrl: LoadingController, private toastCtrl: ToastController, private tracker: TrackingService) {
    let seedName = params.get('name');
    this.node = params.get('node') || new Seed({name: seedName, scope: Seeds.SCOPE_PRIVATE, archived: false}, false, false);
    this.node.author = this.authService.userEmail;
  }

  ionViewDidEnter() {
    this.tracker.trackView('Formulaire - ' + this.node.label);
  }

  closeForm(): void {
    this.explorerService.loadNodeData(this.node.id, () => {
      this.navCtrl.pop();
    });
  }

  dismissForm(): void {
    if(this.node.archived) {
      this.explorerService.navigateBackward(() => {
//EL 3x       this.navCtrl.popToRoot();
        this.navCtrl.navigateRoot('');
      });
    } else if(this.authService.userSeed.id == this.node.id) {
      this.updateUserSeed(() => {
        this.navCtrl.navigateRoot('');
      });
    } else {
      this.explorerService.loadNodeData(this.node.id, () => {
        this.navCtrl.navigateRoot('');
      });
    }
  }

  updateUserSeed(onComplete): void {
    this.dataService.getNodeDetails(this.authService.userSeed.id).then(data => {
      this.authService.userSeed = new Seed(data, false, false);
      onComplete();
    });
  }

//EL  submitForm(): void {
    async submitForm(): Promise<void> {
    this.disabled = true;

    let loading = this.loadingCtrl.create({
//EL      content: 'Enregistrement en cours...',
      message: 'Enregistrement en cours...',
      spinner: 'dots'
    });
//EL     loading.present();    
    (await loading).present();    

    setTimeout(() => {
      loading.dismiss();
    }, 30000);

    this.dataService.saveNode(this.node).then(data => {
      if(data.ok) {
        this.node.id = data.id;
        loading.dismiss();
        this.presentToast("La graine a été enregistrée.", () => {
          this.dismissForm();
        });
      } else {
        this.presentToast("Une erreur est survenue pendant l'enregistrement de la graine.", () => {});
        console.log("saveNode error : " + JSON.stringify(data));
      }
    }).catch(error => {
      this.presentToast("Une erreur est survenue pendant l'enregistrement de la graine.", () => {});
      console.log("submit error : " + JSON.stringify(error))
    });
  }

  editStartDate(): void {
    if(!this.node.startDate) {
      this.node.startDate = new Date().toISOString();
    }
    setTimeout(() => {
      this.startDatePicker.open();
    }, 150);
  }

  editEndDate(): void {
    if(!this.node.endDate) {
      this.node.endDate = new Date().toISOString();
    }
    setTimeout(() => {
      this.endDatePicker.open();
    }, 150);
  }

  clearStartDate(): void {
    this.node.startDate = null;
  }

  clearEndDate(): void {
    this.node.endDate = null;
  }

  toggleScope(scope): void {
    this.node.scope = scope;
    this.node.author = this.authService.userEmail;
  }

  scopeLabel(): string {
    if(this.node.scope == 'apidae') {
      return 'tout le réseau';
    } else if(this.node.scope == 'private') {
      return 'moi uniquement';
    } else {
      return 'tout le monde';
    }
  }

  toggleArchive(): void {
    this.node.archived = !this.node.archived;
  }

  archiveIcon(): string {
    return this.node.archived ? 'trash' : 'pulse';
  }

  archiveLabel(): string {
    return this.node.archived ? 'Graine à supprimer' : 'Graine active';
  }

  archiveColor(): string {
    return this.node.archived ? 'person' : 'product';
  }

  //EL seedTypes(): void {
    async seedTypes(): Promise<void> {
    let typesModal = this.modalCtrl.create('SeedType', {type: this.node.category});
    typesModal.onDidDismiss(data => {
      this.node.category = data.type;
    });
    (await typesModal).present();
  }
//EL addSeed(): void {
  async addSeed(): Promise<void> {
    let seedsModal = this.modalCtrl.create('InternalLinksPage', {node: this.node});
    (await seedsModal).present();
  }

  addUrl(): void {
    this.node.urls.push({value: ''});
  }

 //EL editAvatar(): void {
  async editAvatar(): Promise<void> {
//EL VERIF    let avatarModal = this.modalCtrl.create('EditAvatar');
    let avatarModal = this.modalCtrl.create({component:EditAvatar});
    avatarModal.onDidDismiss(data => {
      if(data && data.data) {
        this.node.attachment = {};
        let attName = 'attachment.' + data.name.split('.').pop();
        this.node.attachment[attName] = {content_type: data.type, data: data.data};
      }
    });
    (await avatarModal).present();
  }

  clearAvatar(): void {
    this.node.attachment = {};
  }

  //EL presentToast(msg, onDismiss) {
  async presentToast(msg, onDismiss) {
      let toast = this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: "middle",
/*EL  showCloseButton: true,
      closeButtonText: "Fermer"*/
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
 /*         handler: () => {
            console.log('Close clicked');
          }*/
        }
      ]
    });
//EL    toast.onDidDismiss(onDismiss);
    (await toast).onDidDismiss();
    (await toast).present();
  }
}
