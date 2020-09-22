// import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

import { MultiSelect } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { defaults } from 'lodash';

// const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;
interface State extends MyQuery {
  allMetaTags: Array<SelectableValue<string>>;
  sensors: Array<SelectableValue<string>>;
  aggrFunctions: Array<SelectableValue<string>>;
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    const query = defaults(this.props.query, defaultQuery);
    this.state = {
      metaTags: query.metaTags,
      allMetaTags: [],
      sensor: query.sensor,
      sensors: [],
      aggrFunc: query.aggrFunc,
      aggrPoints: query.aggrPoints,
      refId: query.refId,
      aggrFunctions: [
        { label: 'none', value: 'none' },
        { label: 'avg', value: 'avg' },
        { label: 'max', value: 'max' },
        { label: 'min', value: 'min' },
      ],
    };
    console.log('props', props);
  }

  onTagsChange = (mt: Array<SelectableValue<string>>) => {
    const { onChange, query, onRunQuery } = this.props;
    this.setState({ metaTags: mt });
    onChange({ ...query, metaTags: mt });
    onRunQuery();
  };

  onAggrFuncChange = (af: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    this.setState({ aggrFunc: af });
    onChange({ ...query, aggrFunc: af });
    onRunQuery();
  };

  onSensorChange = (sensor: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    this.setState({ sensor: sensor });
    if (sensor !== undefined) {
      onChange({ ...query, sensor: sensor });
      onRunQuery();
    }
    this.MetaTags();
    console.log(this.props);
  };

  Sensors = () => {
    return getBackendSrv()
      .datasourceRequest({
        url: this.props.datasource.url + '/list',
        method: 'GET',
      })
      .catch(err => {
        console.error(err);
        return {};
      })
      .then(response => {
        if (response.status === 200 && response.data) {
          const sensors = response.data.map((index: string) => {
            return { label: index, value: index };
          });
          this.setState({ sensors: sensors });
          return sensors;
        }
      });
  };

  MetaTags = () => {
    console.log('this.state', this.state);
    if (!this.state.sensor.value) {
      return;
    }
    const link = this.props.datasource.url + '/meta/' + this.state.sensor.value;
    return getBackendSrv()
      .datasourceRequest({
        url: link,
        method: 'GET',
      })
      .catch(err => {
        console.error(link, err);
        return {};
      })
      .then(response => {
        if (response.status === 200 && response.data !== undefined && response.data !== null) {
          const metaTags = Object.keys(response.data).map((index: string) => {
            return { label: index, value: index };
          });
          this.setState({ allMetaTags: metaTags });
          return metaTags;
        }
        return {};
      });
  };

  componentDidMount() {
    this.Sensors();
    this.MetaTags();
  }

  render() {
    // const query = defaults(this.props.query, defaultQuery);
    // const { queryText, constant } = query;
    // const [value, setValue] = useState<Array<SelectableValue<number>>>([]);

    // const options = [
    //   { label: 'Basic option', value: 0 },
    //   { label: 'Option with description', value: 1, description: 'this is a description' },
    //   {
    //     label: 'Option with description and image',
    //     value: 2,
    //     description: 'This is a very elaborate description, describing all the wonders in the world.',
    //     imgUrl: 'https://placekitten.com/40/40',
    //   },
    // ];
    // console.log("this QueryEditor", this)
    return (
      <div className="gf-form">
        <Select options={this.state.sensors} value={this.state.sensor} onChange={this.onSensorChange} />
        <Select options={this.state.aggrFunctions} value={this.state.aggrFunc} onChange={this.onAggrFuncChange} />
        <MultiSelect onChange={this.onTagsChange} value={this.state.metaTags} options={this.state.allMetaTags} />
      </div>
    );
  }
}
