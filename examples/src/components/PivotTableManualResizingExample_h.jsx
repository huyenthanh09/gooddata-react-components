// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model, Visualization } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
    totalSalesIdentifier,
    yearDateDataSetAttributeIdentifier,
} from "../utils/fixtures";

const measures = [
    Model.measure(franchiseFeesIdentifier)
        .format("#,##0")
        .localIdentifier("m1"),
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .format("#,##0")
        .localIdentifier("m2"),
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .format("#,##0")
        .localIdentifier("m3"),
    Model.measure(franchiseFeesIdentifierOngoingRoyalty)
        .format("#,##0")
        .localIdentifier("m4"),
];

const attributes = [
    Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("state"),
    Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("name"),
    Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menu"),
];

const columns = [
    Model.attribute(quarterDateIdentifier).localIdentifier("quarter"),
    Model.attribute(monthDateIdentifier).localIdentifier("month"),
];

const measures_sppy = [
    Model.popMeasure("totalSales", yearDateDataSetAttributeIdentifier)
        .alias("$ Total Sales - SP year ago")
        .localIdentifier("sppy"),
    Model.measure(totalSalesIdentifier)
        .localIdentifier("totalSales")
        .alias("$ Total Sales"),
];

const attribute_sppy = [Model.attribute(quarterDateIdentifier)];

const sortBy = [Model.attributeSortItem("menu", "asc")];

const totals = [
    {
        measureIdentifier: "m1",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "m1",
        type: "avg",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "m2",
        type: "sum",
        attributeIdentifier: "state",
    },
];

const stateW = Model.attributeColumnWidthItem("state", 60);
const nameW = Model.attributeColumnWidthItem("name", 60);
const menuW = Model.attributeColumnWidthItem("menu", 60);

const sppyw = Model.measureColumnWidthItem("sppy", 60);

const q1JanM2 = Model.measureColumnWidthItem("m2", 60).attributeLocators(
    {
        attributeIdentifier: "quarter",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=1",
    },
    {
        attributeIdentifier: "month",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2071/elements?id=1",
    },
);

const q1JanM3 = Model.measureColumnWidthItem("m3", 60).attributeLocators(
    {
        attributeIdentifier: "quarter",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=1",
    },
    {
        attributeIdentifier: "month",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2071/elements?id=1",
    },
);

const q1DecM1 = Model.measureColumnWidthItem("m1", 60).attributeLocators(
    {
        attributeIdentifier: "quarter",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=4",
    },
    {
        attributeIdentifier: "month",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2071/elements?id=12",
    },
);

const q1DecM4 = Model.measureColumnWidthItem("m4", 60).attributeLocators(
    {
        attributeIdentifier: "quarter",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=4",
    },
    {
        attributeIdentifier: "month",
        element: "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2071/elements?id=12",
    },
);

const m1W = Model.measureColumnWidthItem("m1", 60);
const m2W = Model.measureColumnWidthItem("m2", 60);
const m3W = Model.measureColumnWidthItem("m3", 60);
const m4W = Model.measureColumnWidthItem("m4", 60);

const mm = [
    Model.measure("agGujhRmcjQD").localIdentifier("m1"),
    Model.measure("aaIHiWZjfWNA")
        .format("#,##0")
        .localIdentifier("m2"),
];

const aa = [Model.attribute("label.restaurantlocation.locationstate"), Model.attribute("date.act81lMifn6q")];

const isAttributeColumnWidthItem = columnWidthItem => {
    return columnWidthItem && columnWidthItem.attributeColumnWidthItem !== undefined;
};

const isMeasureColumnWidthItem = columnWidthItem => {
    return columnWidthItem && columnWidthItem.measureColumnWidthItem !== undefined;
};

const isLocatorsEqual = (locator1, locator2) => {
    return (
        locator1[0].attributeLocatorItem.element === locator2[0].attributeLocatorItem.element &&
        locator1[1].measureLocatorItem.measureIdentifier === locator2[1].measureLocatorItem.measureIdentifier
    );
};

const isSameWidthItem = (item, newItem) => {
    if (isAttributeColumnWidthItem(item) && isAttributeColumnWidthItem(newItem)) {
        return (
            item.attributeColumnWidthItem.attributeIdentifier ===
            newItem.attributeColumnWidthItem.attributeIdentifier
        );
    }

    if (isMeasureColumnWidthItem(item) && isMeasureColumnWidthItem(newItem)) {
        return isLocatorsEqual(item.measureColumnWidthItem.locators, newItem.measureColumnWidthItem.locators);
    }

    return false;
};

export class PivotTableManualResizingExample_h extends Component {
    state = {
        columnWidths: [],
    };

    onColumnResized = columnWidths => {
        this.setState({ columnWidths });
        console.log(columnWidths);
    };

    render() {
        return (
            <div>
                <p>measures, rows and columns</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        config={{
                            columnSizing: {
                                columnWidths: [
                                    stateW,
                                    nameW,
                                    menuW,
                                    q1JanM2,
                                    q1JanM3,
                                    q1DecM1,
                                    q1DecM4,
                                    Model.allMeasureColumnWidthItem(100),
                                ],
                                growToFit: false,
                                defaultWidth: "viewport",
                            },
                        }}
                        pageSize={20}
                        onColumnResized={this.onColumnResized}
                        sortBy={sortBy}
                    />
                </div>
                <p>Only measures</p>
                <div style={{ height: 100 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        config={{
                            columnSizing: {
                                columnWidths: [m1W, m2W, m3W, Model.allMeasureColumnWidthItem(100)],
                                growToFit: true,
                                defaultWidth: "viewport",
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>Only rows</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        rows={attributes}
                        config={{
                            columnSizing: {
                                defaultWidth: "unset",
                                growToFit: false,
                                columnWidths: [stateW, nameW, menuW],
                            },
                        }}
                        pageSize={5}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>Only columns</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        columns={attributes}
                        config={{
                            columnSizing: {
                                defaultWidth: "unset",
                                growToFit: true,
                                columnWidths: [
                                    {
                                        measureColumnWidthItem: {
                                            width: 60,
                                            locators: [
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "state",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2210/elements?id=6340109",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "name",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2204/elements?id=6340107",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "menu",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2187/elements?id=6338585",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>measures and rows</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        config={{
                            columnSizing: {
                                defaultWidth: "unset",
                                growToFit: true,
                                columnWidths: [stateW, menuW, m1W, m3W],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>measures and columns</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        columns={attributes}
                        config={{
                            columnSizing: {
                                defaultWidth: "viewport",
                                growToFit: false,
                                columnWidths: [
                                    {
                                        measureColumnWidthItem: {
                                            width: "auto",
                                            locators: [
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "state",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2210/elements?id=6340109",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "name",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2204/elements?id=6340107",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "menu",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2187/elements?id=6338473",
                                                    },
                                                },
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m1",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        measureColumnWidthItem: {
                                            width: "auto",
                                            locators: [
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "state",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2210/elements?id=6340109",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "name",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2204/elements?id=6340107",
                                                    },
                                                },
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "menu",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2187/elements?id=6338473",
                                                    },
                                                },
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m2",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    Model.allMeasureColumnWidthItem(100),
                                ],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>measure, row, column</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={[
                            Model.measure(franchiseFeesIdentifier)
                                .format("#,##0")
                                .localIdentifier("m"),
                        ]}
                        rows={[Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("row")]}
                        columns={[Model.attribute(quarterDateIdentifier).localIdentifier("column")]}
                        config={{
                            columnSizing: {
                                defaultWidth: "viewport",
                                growToFit: true,
                                columnWidths: [
                                    {
                                        measureColumnWidthItem: {
                                            width: 60,
                                            locators: [
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "column",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=1",
                                                    },
                                                },
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        measureColumnWidthItem: {
                                            width: 60,
                                            locators: [
                                                {
                                                    attributeLocatorItem: {
                                                        attributeIdentifier: "column",
                                                        element:
                                                            "/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/2009/elements?id=2",
                                                    },
                                                },
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        attributeColumnWidthItem: {
                                            width: 60,
                                            attributeIdentifier: "row",
                                        },
                                    },
                                    Model.allMeasureColumnWidthItem(100),
                                ],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>

                <p>totals and subtotals</p>
                <div style={{ height: 500 }} className="s-pivot-table-sorting">
                    <PivotTable
                        config={{
                            menu: {
                                aggregations: true,
                                aggregationsSubMenu: true,
                            },
                            columnSizing: {
                                columnWidths: [stateW, nameW, menuW, q1JanM2, q1JanM3, q1DecM1, q1DecM4],
                                //columnWidths: [Model.allMeasureColumnWidthItem(100)],
                                growToFit: false,
                                defaultWidth: "viewport",
                            },
                        }}
                        pageSize={20}
                        onColumnResized={this.onColumnResized}
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        totals={totals}
                    />
                </div>
                <p>2 same measures</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={[
                            Model.measure(franchiseFeesIdentifier)
                                .format("#,##0")
                                .localIdentifier("m1_l"),
                            Model.measure(franchiseFeesIdentifier)
                                .format("#,##0")
                                .localIdentifier("m2_r"),
                        ]}
                        rows={[Model.attribute(quarterDateIdentifier)]}
                        config={{
                            columnSizing: {
                                defaultWidth: "unset",
                                growToFit: false,
                                columnWidths: [
                                    {
                                        measureColumnWidthItem: {
                                            width: 60,
                                            locators: [
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m1_l",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        measureColumnWidthItem: {
                                            width: 60,
                                            locators: [
                                                {
                                                    measureLocatorItem: {
                                                        measureIdentifier: "m2_r",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>sppy</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={measures_sppy}
                        rows={attribute_sppy}
                        config={{
                            columnSizing: {
                                defaultWidth: "viewport",
                                growToFit: true,
                                columnWidths: [sppyw],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                    />
                </div>
                <p>aaaaa</p>
                <div style={{ height: 300 }} className="s-pivot-table-sorting">
                    <PivotTable
                        projectId={projectId}
                        measures={mm}
                        rows={aa}
                        config={{
                            columnSizing: {
                                defaultWidth: "unset",
                                growToFit: false,
                                columnWidths: [],
                            },
                        }}
                        onColumnResized={this.onColumnResized}
                        pageSize={5}
                    />
                </div>
                <p>Visualization</p>
                <div style={{ height: 300 }} className="s-visualization-chart">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11051"
                        config={{
                            columnSizing: {
                                growToFit: true,
                            },
                        }}
                    />
                </div>
                <p>--------</p>
                <div style={{ height: 300 }} className="s-visualization-chart">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11058"
                        /*config={{
                            columnSizing: {
                                growToFit: true,
                            },
                        }}*/
                    />
                </div>
                <p>--------</p>
                <div style={{ height: 300 }} className="s-visualization-chart">
                    <Visualization
                        projectId={projectId}
                        uri="/gdc/md/xp9yfghe4na21w27cyrnyrwx5si2vk6e/obj/11088"
                        config={{
                            columnSizing: {
                                growToFit: true,
                            },
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default PivotTableManualResizingExample_h;
