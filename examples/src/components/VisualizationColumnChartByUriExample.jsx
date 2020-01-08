// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import '@gooddata/react-components/styles/css/main.css';
import { Visualization } from '@gooddata/react-components';

import { projectId, columnVisualizationUri } from '../utils/fixtures';

export class VisualizationColumnChartByIdentifierExample extends Component {
    render() {
        return (
            <div style={{ height: 800 }} className="s-visualization-chart">
                <div style={{ height: 300 }}>
					<Visualization
						projectId={projectId}
						uri={columnVisualizationUri}
						locale = "ja-JP"
					/>
				</div>
				<div style={{ height: 300 }}>
					<Visualization
						projectId={projectId}
						uri="/gdc/md/ht3owbpk6h0yfjtkcsgva3osu3z7paol/obj/10165"
						locale = "ja-JP"
						groupRows='true'
						pageSize={20}
						config={{
							menu: {
								aggregations: true,
								aggregationsSubMenu: true,
							},
						}}
						
					/>
				</div>
            </div>
        );
    }
}

export default VisualizationColumnChartByIdentifierExample;
