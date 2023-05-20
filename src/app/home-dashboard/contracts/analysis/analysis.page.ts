import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { forkJoin, fromEvent } from 'rxjs';
import { map, pairwise, switchMap, takeUntil } from 'rxjs/operators';
import { ContractService } from 'src/app/api/contract.service';
import { UserService } from 'src/app/api/user.service';
import { ContractAnalysisResponse } from 'src/app/shared/models/contract-analysis-response.model';
import { Contract } from 'src/app/shared/models/contract.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
})
export class AnalysisPage implements OnInit, OnDestroy {

  @ViewChild('dataContainer') dataContainer: ElementRef;

  analysisHtml: any;
  contractMetadata: Contract;
  // TODO: add to Contract type?
  receivedFeedback: boolean;
  currentUser: User;
  contractId: string;
  todosDoneList: Set<string>;

  contractData: ContractAnalysisResponse;
  analysisFileType: string;

  // scroll progress bar
  public progress = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
     public sanitizer: DomSanitizer,
     private userService: UserService,
     private contractService: ContractService,
     private authService: AuthService,
     private loadingCtrl: LoadingController,
     private elRef: ElementRef,
     private fb: FormBuilder) {
    this.contractId = this.route.snapshot.params.id;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.currentUser.userType) {
      this.persistData();
    }
  }

  async ngOnInit() {
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;

    const loading = await this.loadingCtrl.create({
      message: 'Loading your contract analysis...',
      duration: 10000,
      spinner: 'circles'
    });
    loading.present();
    // TODO: lost upon refresh: call api to grab contract
    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state.contractMetadata) {
      this.analysisHtml = this.router.getCurrentNavigation().extras.state.analysis;
      this.contractMetadata = this.router.getCurrentNavigation().extras.state.contractMetadata;
      this.contractMetadata.todos = new Set(this.contractMetadata.todos);
      this.contractMetadata.todosDone = new Set(this.contractMetadata.todosDone);
      this.todosDoneList = this.contractMetadata.todosDone;

    } else{
      this.contractService.getMetadata(this.contractId).toPromise().then((c) => {
        this.contractMetadata = c['data'] as Contract;
        this.contractMetadata.todos = new Set(this.contractMetadata.todos);
        this.contractMetadata.todosDone = new Set(this.contractMetadata.todosDone);
        this.todosDoneList = this.contractMetadata.todosDone;

        this.contractService.loadContract(this.currentUser, this.contractMetadata.name, true).subscribe((data) => {
          // load contract depending on format (backwards compatible to html file, handles csv file)
          data.text().then(v => {
            // console.log(data.type);
            if (data.type === 'application/json') {
              // data loaded from csv file
              loading.dismiss();
              const contractAnalysisData = JSON.parse(v);
              this.contractData = contractAnalysisData as ContractAnalysisResponse;
              this.contractData.clauses = JSON.parse(contractAnalysisData['clauses']);
              this.contractData.explanations = JSON.parse(contractAnalysisData['explanations']);
              // remove escaped single quote with just single quote
              this.contractData.explanations = this.contractData.explanations.map((e) => e.replace(/\\'/g, "'"));
              // this.contractData.overview = contractAnalysisData['overview'].split('- ').slice(1);
              this.contractData.overview = JSON.parse(contractAnalysisData['overview']);
              this.loadData(this.contractData, 'csv');
            } else {
              // backwards compatible for pre-generated html file
              loading.dismiss();
              this.analysisHtml = v;
              this.loadData(v, 'html');
            }
          });
        });

      });
    }
    this.receivedFeedback = false;
  }

  ngOnDestroy() {
    // navigates here when you redirect to another page BUT not window refresh/reload
    // console.log('destroyed!');
    // backwards compatible check: only persist with new users with new html
    if (this.currentUser.userType) {
      this.persistData();
    }
  }

  loadData(data, loadedFileType) {
    this.analysisFileType = loadedFileType;
    // backwards compatible check: only execute if new users with new html
    if (this.currentUser.userType && this.contractMetadata) {
      // if this is first time viewing, load up todos list
      if (!this.contractMetadata.todos && !this.contractMetadata.todosDone) {
        // initialize bc doesn't exist
        this.contractMetadata.todos = new Set();
        this.contractMetadata.todosDone = new Set();
        // get all checkboxes and add to todos
        const cbs = this.dataContainer.nativeElement.getElementsByClassName('save-cb-state');
        Array.from(cbs).forEach((cb) => {
            this.contractMetadata.todos.add((cb as HTMLElement).getAttribute('name'));
            // this.contractMetadata.todos.add((cb as HTMLElement).getAttribute('id'));
          });
      }

      if (loadedFileType === 'html') {
        this.dataContainer.nativeElement.innerHTML = data;
        if (this.contractMetadata.todos && this.contractMetadata.todosDone) {
          // Works for pre-generated html
          this.contractMetadata.todosDone.forEach(v => {
            const el = document.querySelector('[name="' + v + '"]') as HTMLInputElement;
            el.checked = true;
          });
        }
      }
    }
  }

  setCheckState(name): boolean {
    // console.log(name);
    return this.contractMetadata.todosDone.has(name);
  }

  persistData() {
    const fileBlob = new Blob([this.dataContainer.nativeElement.innerHTML], { type: 'text/html' });
    const idx = this.contractMetadata.name.lastIndexOf('.');

    // save updated results file and metadata
    // const updatRes$ = this.contractService.updateResult(this.currentUser,
    //   this.contractMetadata.name.slice(0, idx) + '_prediction.html', fileBlob);
    const updateMeta$ = this.contractService.updateMetadata(this.contractMetadata);
    forkJoin([updateMeta$]).subscribe(results => {
      // console.log(results[0]);
      // console.log(results[1]);
    });
  }

  click(event): void {
    const name = event.target.getAttribute('name');
    this.contractMetadata.todos[name] = event.target.checked ?? event.target.value;
  }

  getFeedback() {
    // TODO: check if feedback already given, if not, go to feedback form
    if (!this.receivedFeedback) {
      this.router.navigate(['/home-dashboard/contracts/feedback']);
    } else {
      this.router.navigate(['/home-dashboard/main']);
    }
  }

  async logScrolling($event) {
    // only send the event once
    const scrollElement = await $event.target.getScrollElement();

    // minus clientHeight because trigger is scrollTop
    // otherwise you hit the bottom of the page before
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = scrollElement.scrollTop;

    const scrolled = (currentScrollDepth / scrollHeight);
    // progress on page
    // this.progress = scrolled;
    // OR progress seen overall
    this.progress = this.progress < scrolled ? scrolled : this.progress;
  }

  afterr(evt) {
    const explanation = evt.target.getAttribute('data-value');
    if (explanation) {
      document.getElementById('message').innerHTML = explanation;
    }
    const todo = evt.target.getAttribute('name');
    if (todo) {
      // console.log(this.contractMetadata.todos);
      // console.log('click ', todo);
      // console.log(evt.target.checked);
      // this.contractMetadata.todos[todo] = evt.target.checked;
      if (evt.target.checked) {
        this.contractMetadata.todos.delete(todo);
        this.contractMetadata.todosDone.add(todo);
      } else {
        this.contractMetadata.todosDone.delete(todo);
        this.contractMetadata.todos.add(todo);
      }
    }
  }

}
