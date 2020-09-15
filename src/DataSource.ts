import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  Labels,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
// import { DataSourceHttpSettings } from '@grafana/ui';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = String(instanceSettings.url);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    console.log('instanceSettings', this.url);
    const promises = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      console.log(query, options);
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
            const l = Label{}
            frame.appendRow([point.Timestamp, point.Value,  query.sensor.label]);
          });
          console.log(frame)
          return frame
        });
      }
      return this.extractData(query, from, to).then(response => {
        response.data.forEach((point: any) => {
          if (point.Values.length > 0) {
            frame.appendRow([point.Start, point.Values[0], query.sensor.label]);
          }
        });
        return frame
      });
    });

    return Promise.all(promises).then(data => ({ data }));
  }

  rawPoints = (frame: MutableDataFrame, response: { data: any[] | null }) => {
    if (response.data === undefined || response.data == null) {
      return frame;
    }
    console.log(frame)
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

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
