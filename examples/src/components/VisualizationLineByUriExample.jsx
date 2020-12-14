// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Visualization } from "@gooddata/react-components";
import { HeaderPredicateFactory } from "@gooddata/react-components";

import { projectId, lineVisualizationUri } from "../utils/fixtures";

export class VisualizationTable extends Component {
    render() {
        return (
            <div>
                <p>hidden data points </p>
                <div style={{ height: 300 }} className="s-visualization-line">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/12980"
                        drillableItems={[
                            HeaderPredicateFactory.uriMatch(
                                "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2364",
                            ),
                        ]}
                    />
                </div>
                <p />
                <div style={{ height: 300 }} className="s-visualization-line">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/12979"
                    />
                </div>
                <p />
                <div style={{ height: 300 }} className="s-visualization-line">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/12978"
                    />
                </div>
            </div>
        );
    }
}

export default VisualizationTable;
