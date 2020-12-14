// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import "@gooddata/react-components/styles/css/main.css";
import { Visualization } from "@gooddata/react-components";

import { projectId, tableVisualizationUri } from "../utils/fixtures";

const config ={
    menu: {
        aggregations: true,
        aggregationsSubMenu: true
    },
    

}

export class AutoResizeTable extends Component {
    render() {
        return (
            <div className="s-visualization-table">
                <div style={{height: 300}}> <Visualization
                    projectId={projectId}
                    uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11064"
                    pageSize={10}
                /></div>
                <br></br>
                <div style={{height: 300}}> <Visualization
                    projectId={projectId}
                    uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/10963"
                /></div>
                <br></br>
                <div style={{height: 300}}> <Visualization
                    projectId={projectId}
                    uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11050"
                /></div>
                <br></br>
				<p>Manual resizing</p>
                <div style={{height: 400}}> <Visualization
                    projectId={projectId}
                    uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11051"
                    //config={config}
                /></div>
            </div>
        );
    }
}

export default AutoResizeTable;
