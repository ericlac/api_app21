import {Component, ViewChild} from "@angular/core";
//EL import {ViewController, Content, IonicPage, Searchbar, NavParams} from "@ionic/angular";
import {ModalController, IonContent, IonSearchbar, NavParams} from "@ionic/angular";
import {ExplorerService} from "../../services/explorer.service";
import {Seeds} from "../../services/seeds";
import {Keyboard} from "@ionic-native/keyboard";
import {Seed} from "../../models/seed.model";
//EL import {animate, state, style, transition, trigger} from "@angular/animations";
import {animate, state, style, transition, trigger} from "@angular/animation";
import {SeedsService} from "../../services/seeds.service";
import {SearchPage} from "../search/search";

/*EL
@IonicPage({
  segment: 'graines'
})*/
@Component({
  templateUrl: 'internal-links.html',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: '0' })),
      state('*', style({ opacity: '1' })),
      transition('void <=> *', animate('500ms ease-out'))
    ])
  ]
})
export class InternalLinksPage {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  public node: Seed;
  public searching: boolean;
  public searchQuery: string;
  public searchScope: string;
  public resultsIds: Array<string>;
  public results: Array<Seed>;

  constructor(public viewCtrl: ModalController, private params: NavParams,
//EL              private keyboard: Keyboard, public explorerService: ExplorerService, public seedsService: SeedsService) {
              private keyboard: typeof Keyboard, public explorerService: ExplorerService, public seedsService: SeedsService) {
    this.searchQuery = null;
    this.searchScope = Seeds.SCOPE_ALL;
    this.searching = false;
    this.results = [];
    this.resultsIds = [];
    this.node = params.get('node');
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.keyboard.show();
    }, 200);
  }

  dismiss() {
    this.clearResults();
    this.viewCtrl.dismiss();
  }

  clearResults(): void {
    this.searchQuery = null;
    this.results = [];
    this.resultsIds = [];
    this.searching = false;
 //EL   this.content.resize();
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
 //EL         this.content.resize();
        });
      });
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

  toggleConnection(seed) {
    if(this.node.connections.indexOf(seed.id) != -1) {
      this.node.removeConnection(seed)
    } else {
      this.node.addConnection(seed);
    }
  }

  toggleInclusion(seed) {
    if(this.node.inclusions.indexOf(seed.id) != -1) {
      this.node.includedSeeds.splice(this.node.includedSeeds.indexOf(seed), 1);
      this.node.inclusions.splice(this.node.inclusions.indexOf(seed.id), 1);
    } else {
      this.node.includedSeeds.push(seed);
      this.node.inclusions.push(seed.id);
    }
  }
}
