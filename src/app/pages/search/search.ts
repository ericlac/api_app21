import {Component, ViewChild} from '@angular/core';
//EL:import {NavController, Searchbar, IonicPage, Content} from '@ionic/angular';
import {NavController, IonSearchbar, IonContent} from '@ionic/angular';
import {ExplorerService} from "../../services/explorer.service";
import {FormPage} from "../form/form";
import {Keyboard} from "@ionic-native/keyboard";
import {Seeds} from "../../services/seeds";
import {SeedsService} from "../../services/seeds.service";
import {Seed} from "../../models/seed.model";
import {AuthService} from "../../services/auth.service";
import {TrackingService} from "../../services/tracking.service";

/*EL @IonicPage({
  segment: 'recherche'
})
*/
@Component({
  templateUrl: 'search.html'
})
export class SearchPage {
  public static readonly BATCH_SIZE = 50;

//EL:  @ViewChild(Searchbar) searchbar: Searchbar;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
//EL:  @ViewChild(Content) content: Content;
  @ViewChild(IonContent) content: IonContent;

  public searching: boolean;
  public searchQuery: string;
  public searchScope: string;
  public activityScope: string;
  public resultsIds: Array<string>;
  public results: Array<Seed>;
  public changesAuthors: any;

  constructor(public explorerService: ExplorerService, public seedsService: SeedsService, private tracker: TrackingService,
//EL              private authService: AuthService, private keyboard: Keyboard, private navCtrl: NavController) {
              private authService: AuthService, private keyboard: typeof Keyboard, private navCtrl: NavController) {
    this.searchQuery = null;
    this.searchScope = Seeds.SCOPE_ALL;
    this.results = [];
    this.resultsIds = [];
    this.searching = false;
    this.changesAuthors = {};
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.keyboard.show();
    }, 200);
    this.activityScope = 'self';
    this.loadUserActivity();
  }

  toggleActivity(scope) {
    this.activityScope = scope;
    this.changesAuthors = {};
    if(this.activityScope == 'network') {
      this.loadChangesFeed();
    } else {
      this.loadUserActivity();
    }
  }

  loadUserActivity() {
    this.results = [];
    this.searching = true;
    this.seedsService.lookUpNodes(this.authService.userEmail).then((seeds) => {
      this.results = seeds;
      this.searching = false;
    });
    this.tracker.trackView('Mon activit??');
  }

  loadChangesFeed() {
    this.results = [];
    this.searching = true;
    console.time('changes-feed');
    let changes = this.seedsService.changesFeed(SearchPage.BATCH_SIZE + 5)
      .on('change', (change) => {
        if(this.results.length < SearchPage.BATCH_SIZE) {
          if(change.doc.name && !change.deleted) {
            this.results.push(new Seed(change.doc, false, false));
          }
        } else {
          changes.cancel();
        }
      }).on('complete', (info) => {
        console.timeEnd('changes-feed');
        if(this.results.length > 0) {
          let emails = this.results.reduce((mails, change) => {
            if(change.author) {
              mails.push(change.author);
            }
            return mails;
          }, []);
          if(emails.length > 0) {
            this.seedsService.getUsersSeeds(emails).then((authorsByEmail) => {
              this.changesAuthors = authorsByEmail;
            });
          }
        }
        this.searching = false;
      }).on('error', (err) => {
        console.log("Changes feed error : " + JSON.stringify(err));
        changes.cancel();
      });

    setTimeout(function() {
      changes.cancel();
    }, 5000);
    this.tracker.trackView('Activit?? du r??seau');
  }

  authorInfo(seed) {
    return this.changesAuthors[seed.author] ? this.changesAuthors[seed.author].label : '';
  }

  updateInfo(seed) {
    return "Le " + this.dateFormat(seed.updateDate || seed.creationDate);
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getUTCDate()), this.lpad(dateObj.getUTCMonth() + 1), dateObj.getUTCFullYear()].join('/') +
        ' ?? ' + [this.lpad(dateObj.getUTCHours()), this.lpad(dateObj.getUTCMinutes())].join(':');
    }
    return '';
  }

  lpad(d): string {
    return d < 10 ? ('0' + d) : d;
  }

  navigateTo(node): void {
 //EL   this.explorerService.navigateTo(node, () => {this.navCtrl.popToRoot();});
    this.explorerService.navigateTo(node, () => {this.navCtrl.navigateRoot('');});
  }

  clearResults(evt): void {
    this.searchQuery = null;
    this.results = [];
    this.resultsIds = [];
    this.searching = false;
  //EL  this.content.resize();
    this.toggleActivity(this.activityScope);
  }

  closeSearch(): void {
    this.clearResults({});
    this.navCtrl.pop();
  }

  scopeChanged(evt): void {
    this.searchNodes(evt);
  }

  searchNodes(evt): void {
    if (this.validQuery()) {
      this.results = [];
      this.searching = true;
      this.seedsService.searchNodes(this.searchQuery, this.searchScope).then((seedsIds) => {
        this.resultsIds = seedsIds;
        this.seedsService.getNodes(seedsIds.slice(0, SearchPage.BATCH_SIZE)).then((seeds) => {
          this.results = seeds;
          this.searching = false;
 //EL     this.content.resize();
        });
      });
      this.tracker.trackView('Recherche : ' + this.searchQuery);
    }
  }

  doInfinite() {
    if(this.resultsIds.length > this.results.length) {
      return this.seedsService
        .getNodes(this.resultsIds.slice(this.results.length, this.results.length + SearchPage.BATCH_SIZE))
        .then((seeds) => {
          this.results.push(...seeds);
          return Promise.resolve();
      });
    } else {
      return Promise.resolve();
    }
  }

  validQuery(): boolean {
    return this.searchQuery && this.searchQuery.trim() != '' && this.searchQuery.length > 2;
  }

  createSeed() {
//EL    this.navCtrl.push('FormPage', {name: this.searchQuery});
    this.navCtrl.navigateForward('FormPage', {name: this.searchQuery});
  }
}
