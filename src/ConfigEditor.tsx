import React, { PureComponent } from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

// const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  // onURLChange = (config: DataSourceSettings<DataSourceJsonData>) => {
  //   const { onOptionsChange, options } = this.props;
  //   // console.log("onURLChange", config, options);
  //   onOptionsChange(options);
  // };

  render() {
    const { options, onOptionsChange } = this.props;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <DataSourceHttpSettings
            defaultUrl="http://localhost:47375"
            dataSourceConfig={options}
            showAccessOptions={true}
            onChange={onOptionsChange}
          />
        </div>
      </div>
    );
  }
}
