import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export interface MyQuery extends DataQuery {
  sensor: SelectableValue<string>;
  aggrPoints: number;
  aggrFunc: SelectableValue<string>;
  metaTags: Array<SelectableValue<string>>;
  annsensor?: string;
  annkey?: string;
  annfilter?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  sensor: {},
  aggrPoints: 10000,
  aggrFunc: { label: 'none', value: 'none' },
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url?: string;
}
