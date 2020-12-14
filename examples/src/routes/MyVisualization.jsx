// (C) 2007-2018 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";
import AutoResizeTable from "../components/AutoResizeTable";

import AutoResizeTableSRC from "!raw-loader!../components/AutoResizeTable";


export const MyVisualization = () => (
    <div>
        <h1>My Visualization</h1>


        <hr className="separator" />

        <h2 id="table">Auto resized column</h2>
        <ExampleWithSource for={AutoResizeTable} source={AutoResizeTableSRC} />

        
    </div>
);

export default MyVisualization;
