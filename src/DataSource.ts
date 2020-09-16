import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  AnnotationQueryRequest,
  AnnotationEvent,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
// import { DataSourceHttpSettings } from '@grafana/ui';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    console.log("instanceSettings", instanceSettings)
    this.url = String(instanceSettings.url);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    console.log("optionss", options)
    console.log("this", this)
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    const promises = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', type: FieldType.number },
          { name: 'Tag', type: FieldType.other },
        ],
      });

      if (query.aggrFunc.value === 'none') {
        return this.extractData(query, from, to).then(response => {
          response.data.forEach((point: any) => {
            frame.appendRow([point.Timestamp, point.Value, query.sensor.label]);
          });
          return frame;
        });
      }
      return this.extractData(query, from, to).then(response => {
        response.data.forEach((point: any) => {
          if (point.Values.length > 0) {
            frame.appendRow([point.Start, point.Values[0], query.sensor.label]);
          }
        });
        return frame;
      });
    });

    return Promise.all(promises).then(data => ({ data }));
  }

  rawPoints = (frame: MutableDataFrame, response: { data: any[] | null }) => {
    if (response.data === undefined || response.data == null) {
      return frame;
    }
    response.data.forEach((point: any) => {
      frame.appendRow([point.Timestamp, point.Value]);
    });
    return frame;
  };

  aggrPoints = (frame: MutableDataFrame, response: { data: any[] | null }) => {
    if (response.data == null) {
      return frame;
    }
    response.data.forEach((point: any) => {
      if (point.Values.length > 0) {
        frame.appendRow([point.Timestamp, point.Values[0]]);
      }
    });
    return frame;
  };

  async extractData(params: MyQuery, from: number, to: number) {
    var link =
      this.url +
      '/extract/' +
      params.sensor.value +
      '/' +
      from +
      '-' +
      to +
      '/' +
      params.aggrPoints +
      'ms/' +
      params.aggrFunc.value +
      '/json';
    // var datapoints

    return await getBackendSrv().datasourceRequest({
      url: link,
      method: 'GET',
    });
  }

  async annotationQuery(options: AnnotationQueryRequest<MyQuery>): Promise<AnnotationEvent[]> {
    console.log('annotationQuery', options);

    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();
    let valfilter:Array<string> = []

    const events: AnnotationEvent[] = [];
    
    if (!options.annotation.annsensor || !options.annotation.annkey){
      return events
    }

    const link = this.url + "/meta/" + options.annotation.annsensor + "/" + options.annotation.annkey

    if (options.annotation.annfilter){
      valfilter = options.annotation.annfilter.split(",")
      valfilter = valfilter.map(s => {return s.trim()})
    }
    console.log(valfilter.indexOf("k6v1asds"), valfilter, options.annotation.annfilter)


    return await getBackendSrv().datasourceRequest({
      url: link,
      method: 'GET',
    }).then(response => {
      if (response.data === undefined || response.data == null) {
        return events;
      }
      Object.entries(response.data).forEach((entrie: Array<number>) => {
        if (valfilter.length <= 0 || valfilter.indexOf(entrie[0]) >= 0){
          entrie[1].forEach(rng => {
            rng = rngCalc([from, to], rng)
            if (rng.length > 0){
             let event: AnnotationEvent = {
               time: rng[0],
               timeEnd: rng[1],
               isRegion: true,
               text: entrie[0],
               tags: [String(options.annotation.annsensor), String(options.annotation.annkey)],
             };
             events.push(event)
            }
          })
        }
      });
      return events;
    });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}

function rngCalc(glrng:Array<number>, rng:Array<number>){
  let left = rng[0]
  let right = rng[1]

  if (rng[1] < glrng[0]){
    return []
  }
  if (rng[0] > glrng[1]){
    return []
  }
  if (rng[0] < glrng[0]){
   left =  glrng[0]
  }
  if (rng[1] > glrng[1]){
    right = glrng[1]
   }
   return [left, right]

}