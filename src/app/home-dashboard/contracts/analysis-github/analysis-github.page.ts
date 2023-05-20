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
import { DiffEditorModel,  MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
@Component({
  selector: 'app-analysis-github',
  templateUrl: './analysis-github.page.html',
  styleUrls: ['./analysis-github.page.scss'],
})
export class AnalysisGithubPage implements OnInit, OnDestroy {

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
  //message displayed flag
  explanationDisplayed = false;
  //content displayed flag
  explanationCheckBox = true;
  commentCheckBox = false;
  editCheckBox = true;

  detailBtn = false;
  // scroll progress bar
  public progress = 0;


  typeSelected = "split";

  diffOptions = {
    theme: 'vs',
    language: 'plaintext',
    readOnly: true,
    renderSideBySide: true,
    wordWrap: true,
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
     public sanitizer: DomSanitizer,
     private userService: UserService,
     private contractService: ContractService,
     private authService: AuthService,
     private loadingCtrl: LoadingController,
     private elRef: ElementRef,
     private fb: FormBuilder,) {
    this.contractId = this.route.snapshot.params.id;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.currentUser.userType) {
      this.persistData();
    }
  }
  
  originalModel: DiffEditorModel = {
    code: '',
    language: 'plaintext'
  };

  modifiedModel: DiffEditorModel = {
    code: '',
    language: 'plaintext'
  };

  async ngOnInit() {
  


    this.originalModel = Object.assign({}, this.originalModel, {
      code: "Lorem ipsum dolor sit amet consectetur. At elementum eget enim natoque ac elit sed ultricies. A etiam risus at nibh eget in eget. Urna lacus sociis nunc aliquet elementum netus cursus mollis. Eget luctus pharetra sollicitudin risus amet. Nisi ornare nibh ut et vitae id ut tempor bibendum. " +

      "Aliquet nullam amet sollicitudin fringilla et. Pharetra cras neque sed sodales egestas elementum enim elit. Vel commodo massa adipiscing ut vel eget donec viverra pellentesque. Porttitor morbi mauris nec ut aliquet."+
      
      "Duis WORD viverra massa mauris. Lobortis arcu viverra varius aliquam luctus lectus eget nunc sed. Viverra dignissim sollicitudin aliquam mauris vehicula id pharetra fames amet. Quis tristique egestas orci vel sed enim enim. Duis etiam porta fusce id euismod. Turpis sit magna mattis auctor. Sit tristique nisl posuere gravida gravida laoreet sed."+
      
      "Ac massa adipiscing pharetra maecenas purus viverra. Neque lacus egestas fames maecenas. Pellentesque eget vestibulum elementum id. Integer eros lacus velit fringilla tincidunt ultricies. Integer urna tortor eu cras turpis. Sit sed ut quam amet eu sed suspendisse a vel. "+
      
      "Sit massa amet ullamcorper lacus. Nam lorem volutpat consequat posuere. Condimentum porta a cras in donec accumsan. "
    });
    this.modifiedModel = Object.assign({}, this.originalModel, {
      code: "Lorem ipsum dolor sit amet consectetur. At elementum this part is different eget enim natoque ac elit sed ultricies. A etiam risus at nibh eget in eget. Urna lacus sociis nunc aliquet elementum netus cursus mollis. Eget luctus pharetra sollicitudin risus amet. Nisi ornare nibh ut et vitae id ut tempor bibendum. "+

      "Aliquet nullam amet sollicitudin fringilla et. Pharetra cras neque sed sodales egestas elementum enim elit. Vel commodo massa adipiscing ut vel eget donec viverra pellentesque. Porttitor morbi mauris nec ut aliquet."+
      
      "Duis CHANGED viverra massa mauris. Lobortis arcu viverra varius aliquam luctus lectus eget nunc sed. Viverra dignissim sollicitudin aliquam mauris vehicula id pharetra fames amet. Quis tristique egestas orci vel sed enim enim. Duis etiam porta fusce id euismod. Turpis sit magna mattis auctor. Sit tristique nisl posuere gravida gravida laoreet sed."+
      
      "Ac massa adipiscing pharetra maecenas purus viverra. Neque lacus egestas fames maecenas. Pellentesque eget vestibulum elementum id. Integer eros lacus velit fringilla tincidunt ultricies. Integer urna tortor eu cras turpis. Sit sed ut quam amet eu sed suspendisse a vel. "
    });

    const u = await this.userService.getCurrentUser();
    this.currentUser = u;

    // const loading = await this.loadingCtrl.create({
    //   message: 'Loading your contract analysis...',
    //   duration: 10000,
    //   spinner: 'circles'
    // });
    // loading.present();
    // TODO: lost upon refresh: call api to grab contract
    // if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state.contractMetadata) {
    //   this.analysisHtml = this.router.getCurrentNavigation().extras.state.analysis;
    //   this.contractMetadata = this.router.getCurrentNavigation().extras.state.contractMetadata;
    //   this.contractMetadata.todos = new Set(this.contractMetadata.todos);
    //   this.contractMetadata.todosDone = new Set(this.contractMetadata.todosDone);
    //   this.todosDoneList = this.contractMetadata.todosDone;

    // } else{
    //   this.contractService.getMetadata(this.contractId).toPromise().then((c) => {
    //     this.contractMetadata = c['data'] as Contract;
    //     this.contractMetadata.todos = new Set(this.contractMetadata.todos);
    //     this.contractMetadata.todosDone = new Set(this.contractMetadata.todosDone);
    //     this.todosDoneList = this.contractMetadata.todosDone;

    //     this.contractService.loadContract(this.currentUser, this.contractMetadata.name, true).subscribe((data) => {
    //       // load contract depending on format (backwards compatible to html file, handles csv file)
    //       data.text().then(v => {
    //         // console.log(data.type);
    //         if (data.type === 'application/json') {
    //           // data loaded from csv file
    //           loading.dismiss();
    //           const contractAnalysisData = JSON.parse(v);
    //           this.contractData = contractAnalysisData as ContractAnalysisResponse;
    //           this.contractData.clauses = JSON.parse(contractAnalysisData['clauses']);
    //           this.contractData.explanations = JSON.parse(contractAnalysisData['explanations']);
    //           // remove escaped single quote with just single quote
    //           this.contractData.explanations = this.contractData.explanations.map((e) => e.replace(/\\'/g, "'"));
    //           // this.contractData.overview = contractAnalysisData['overview'].split('- ').slice(1);
    //           this.contractData.overview = JSON.parse(contractAnalysisData['overview']);
    //           this.loadData(this.contractData, 'csv');
    //         } else {
    //           // backwards compatible for pre-generated html file
    //           loading.dismiss();
    //           this.analysisHtml = v;
    //           this.loadData(v, 'html');
    //         }
    //       });
    //     });

    //   });
    // }
    // this.receivedFeedback = false;
  }

  ngOnDestroy() {
    if(this.currentUser.userType) {
      this.persistData();
    }
  }

  arrow(event): void {
    this.explanationDisplayed = !this.explanationDisplayed;
    document.getElementById('header').style.display = this.explanationDisplayed ? 'flex' : 'block';
  }

  explanationCheckBoxClicked(event): void {
    this.explanationCheckBox = !this.explanationCheckBox;
  }

  commentCheckBoxClicked(event): void {
    this.commentCheckBox = !this.commentCheckBox;
  }

  editCheckBoxClicked(event): void {
    this.editCheckBox = !this.editCheckBox;
  }

  detailBtnClicked(event): void {
    this.detailBtn = !this.detailBtn;
  }

  detailModelClicked(event): void {
    if(event.target == document.getElementById('detailModel')){
      this.detailBtn = !this.detailBtn;
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

  async logScrolling($event) {
    // only send the event once
    const scrollElement = await $event.target.getScrollElement();

    // minus clientHeight because trigger is scrollTop
    // otherwise you hit the bottom of the page before
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = scrollElement.scrollTop;

    const scrolled = Math.floor((currentScrollDepth / scrollHeight) * 100);
    // progress on page
    // this.progress = scrolled;
    // OR progress seen overall
    this.progress = this.progress < scrolled ? scrolled : this.progress;
    document.getElementById('progress').style.width = this.progress + "%";
  }

  getFeedback() {
    // TODO: check if feedback already given, if not, go to feedback form
    if (!this.receivedFeedback) {
      this.router.navigate(['/home-dashboard/contracts/feedback']);
    } else {
      this.router.navigate(['/home-dashboard/main']);
    }
  }

  splitBtnClicked(event): void {
    if(this.typeSelected == "split")
      return;
    this.typeSelected = "split";
    document.getElementById('splitBtn').classList.remove('splitBtnUnClicked');
    document.getElementById('splitBtn').classList.add('splitBtnClicked');
    document.getElementById('unifiedBtn').classList.remove('unifiedBtnClicked');
    document.getElementById('unifiedBtn').classList.add('unifiedBtnUnClicked');
  }

  unifiedBtnClicked(event): void {
    if(this.typeSelected == "unified")
      return;
    this.typeSelected = "unified";
    document.getElementById('splitBtn').classList.remove('splitBtnClicked');
    document.getElementById('splitBtn').classList.add('splitBtnUnClicked');
    document.getElementById('unifiedBtn').classList.remove('unifiedBtnUnClicked');
    document.getElementById('unifiedBtn').classList.add('unifiedBtnClicked');
  }
}