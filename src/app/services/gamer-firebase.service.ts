import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Gamer } from '../models/gamer';
import { LobbyFirebaseService } from 'src/app/services/lobby-firebase.service';
import { Observable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamerFirebaseService {

  private gamers: firebase.database.Reference;

  constructor(
    private firebase: AngularFireDatabase,
    private lobbyService: LobbyFirebaseService,
  ) {
    this.gamers = this.firebase.database.ref().child('gamers');
  }

  insertar(model: Gamer): Observable<string> {
    return Observable.create((observer: Subscriber<string>) => {
      const keyGamer = this.gamers.push().key;
      this.firebase.database.ref('gamers/' + keyGamer).set({
        avatar: model.avatar,
        nick: model.nick,
        avatarKey: model.avatarKey,
        score: 0,
      });

      this.lobbyService.connectAvailableLobby(keyGamer).subscribe(
        response => {
          observer.next(response);
        },
        error => {
          console.log(error);
          observer.next('');
        }
      );
    });
  }

  findGamerByKey(keyGamer: string): Observable<Gamer> {
    return Observable.create((observer: Subscriber<Gamer>) => {
      this.firebase.object('gamers/' + keyGamer).valueChanges().subscribe((gamer: Gamer) => {
        gamer.$key = keyGamer;
        observer.next(gamer);
      });
    });
  }

  updateScore(gamer: Gamer, incrementPoints: number): Observable<boolean> {
    return Observable.create((observer: Subscriber<boolean>) => {
      this.firebase.database.ref('gamers/' + gamer.$key).update({
        score: gamer.score + incrementPoints,
      }).then(response => {
        observer.next(true);
      }).catch(error => {
        observer.next(false);
      });
    });
  }
}
