// import { MyQuery } from 'types';

export class AnnotationQueryEditor {
  static templateUrl = 'partials/annotations.editor.html';

  annotation: any;

  constructor() {
    this.annotation.annsensor = this.annotation.annsensor || '';
    this.annotation.annkey = this.annotation.annkey || '';
    this.annotation.annfilter = this.annotation.annfilter || '';
  }
}
