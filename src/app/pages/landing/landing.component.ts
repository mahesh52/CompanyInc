import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbPopover, NgbSlideEvent, NgbSlideEventSource} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import { SSE } from "./sse";
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  pauseOnHover = true;
  paused = false;
  state = {
    newNotifications: [],
    notifications: [],
    loggedInUser: null,
    username: "",
    to: "",
    message: "",
  };

  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;
  @ViewChild('popover',{static:true}) popover:NgbPopover;
  constructor(private router: Router) {
    this.initListener();
  }

  ngOnInit() {
    if (sessionStorage.getItem('auth') !== null && sessionStorage.getItem('auth') !== undefined) {
      this.router.navigateByUrl("portals");
    }
  }

  initListener = () => {
    EventSource = SSE;
    const eventSource = new SSE("http://ec2-3-133-143-117.us-east-2.compute.amazonaws.com:9192/UploadProductEmitter/u@2001/d@2003", {headers: {'Content-Type': 'application/json'},
      payload: '["ORD9999@JESSI-999"]'});
    // const eventSource = new EventSource("http://localhost:9192/UploadProductEmitter/u@2001/d@2003");
    // eventSource.addEventListener('status', function (e) {
    //   console.log('System status is now: ' + e.data);
    // });

    eventSource.addEventListener(
      this.state.loggedInUser,
      this.handleServerEvent,
      false
    );

    eventSource.addEventListener(
      'progress',
      this.handleServerEvent,
      false
    );

    eventSource.addEventListener("COMPLETE", function (evt) {
      console.log(evt);
      eventSource.close();
    });
    eventSource.stream();

    eventSource.onopen = (e) => console.log("open");

    eventSource.onerror = (e) => {
      if (e.readyState == EventSource.CLOSED) {
        console.log("close");
      } else {
        console.log(e);
      }
      this.initListener();
    };


  };
  handleServerEvent = (e) => {
    const json = JSON.parse(e.data);
    console.log(json);
    let newNotifications = this.state.newNotifications;
    newNotifications.unshift({
      from: json.from,
      message: json.message,
      isRead: false,
    });

   // this.setState({ newNotifications: newNotifications });
  };
  onSlide(slideEvent: NgbSlideEvent) {
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }
  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }
  registerUser(){
    this.router.navigate(['register']);
  }
}
