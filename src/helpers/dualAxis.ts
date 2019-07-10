// (C) 2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import get = require("lodash/get");
import { IChartConfig } from "../interfaces/Config";
import { getIdentifierFromBucketsItem } from "./mdObjBucketHelper";
import { SECONDARY_MEASURES } from "../constants/bucketNames";
import { isComboChart } from "../components/visualizations/utils/common";
import { VisType } from "../constants/visualizationTypes";

export function setMeasuresToSecondaryAxis(config: IChartConfig = {}): IChartConfig {
    const isDualAxis: boolean = get(config, "dualAxis", true);
    const type: VisType = get(config, "type");
    const { secondary_yaxis: secondaryYAxis, ...remainConfig } = config;
    const buckets: VisualizationObject.IBucket[] = get(config, "mdObject.buckets");
    const secondaryIdentifierMeasures: string[] = getIdentifierFromBucketsItem(
        buckets,
        SECONDARY_MEASURES,
        "measure",
    );

    if (!isComboChart(type)) {
        return config;
    }

    if (!isDualAxis) {
        return remainConfig;
    }

    return {
        ...remainConfig,
        secondary_yaxis: {
            ...secondaryYAxis,
            measures: secondaryIdentifierMeasures,
        },
    };
}
