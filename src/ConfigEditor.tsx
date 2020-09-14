import React, { ChangeEvent, PureComponent } from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourceJsonData, DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { MyDataSourceOptions } from './types';

// const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onURLChange = (config: DataSourceSettings<DataSourceJsonData>) => {
    console.log(config);
    const { onOptionsChange, options } = this.props;
    onOptionsChange({ ...options });
  };
  onPathChange = () => {
    const { onOptionsChange, options } = this.props;
    console.log(options);
    onOptionsChange({ ...options });
  };

  // Secure field (only sent to the backend)
  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  onResetAPIKey = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

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
