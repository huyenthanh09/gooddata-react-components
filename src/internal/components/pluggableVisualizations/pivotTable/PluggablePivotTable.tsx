// (C) 2019-2020 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import merge = require("lodash/merge");
import flatMap = require("lodash/flatMap");
import isNil = require("lodash/isNil");
import includes = require("lodash/includes");
import * as React from "react";
import ReactMeasure from "react-measure";
import { render } from "react-dom";
import { IntlShape } from "react-intl";
import { AFM, VisualizationObject } from "@gooddata/typings";
import produce from "immer";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";

import * as VisEvents from "../../../../interfaces/Events";
import * as BucketNames from "../../../../constants/bucketNames";
import {
    IAttributeFilter,
    IBucket,
    IBucketFilter,
    IBucketItem,
    IExtendedReferencePoint,
    IFeatureFlags,
    ILocale,
    IReferencePoint,
    isAttributeFilter,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket";

import {
    getAllItemsByType,
    getItemsFromBuckets,
    getTotalsFromBucket,
    removeDuplicateBucketItems,
    sanitizeFilters,
} from "../../../utils/bucketHelper";

import { setPivotTableUiConfig } from "../../../utils/uiConfigHelpers/pivotTableUiConfigHelper";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import { DEFAULT_PIVOT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import {
    getColumnWidthsFromProperties,
    getReferencePointWithSupportedProperties,
} from "../../../utils/propertiesHelper";
import { VisualizationEnvironment } from "../../../../components/uri/Visualization";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { IPivotTableProps, PivotTable } from "../../../../components/core/PivotTable";
import { generateDimensions } from "../../../../helpers/dimensions";
import { DEFAULT_LOCALE } from "../../../../constants/localization";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { ColumnWidthItem, IMenu, IPivotTableConfig } from "../../../../interfaces/PivotTable";
import { adaptReferencePointWidthItemsToPivotTable } from "./widthItemsHelpers";
import { PIVOT_TABLE_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import { getTableConfigFromFeatureFlags } from "../../../../helpers/featureFlags";

export const getColumnAttributes = (buckets: IBucket[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [BucketNames.COLUMNS, BucketNames.STACK, BucketNames.SEGMENT],
        [ATTRIBUTE, DATE],
    );
};

export const getRowAttributes = (buckets: IBucket[]): IBucketItem[] => {
    return getItemsFromBuckets(
        buckets,
        [
            BucketNames.ATTRIBUTE,
            BucketNames.ATTRIBUTES,
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.LOCATION,
        ],
        [ATTRIBUTE, DATE],
    );
};

// removes attribute sortItems with invalid identifiers
// removes measure sortItems with invalid identifiers and invalid number of locators
function adaptSortItemsToPivotTable(
    originalSortItems: AFM.SortItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
): AFM.SortItem[] {
    const attributeLocalIdentifiers = [...rowAttributeLocalIdentifiers, ...columnAttributeLocalIdentifiers];

    return originalSortItems.reduce((sortItems: AFM.SortItem[], sortItem: AFM.SortItem) => {
        if (AFM.isMeasureSortItem(sortItem)) {
            // filter out invalid locators
            const filteredSortItem: AFM.IMeasureSortItem = {
                measureSortItem: {
                    ...sortItem.measureSortItem,
                    locators: sortItem.measureSortItem.locators.filter(locator => {
                        // filter out invalid measure locators
                        if (AFM.isMeasureLocatorItem(locator)) {
                            return includes(
                                measureLocalIdentifiers,
                                locator.measureLocatorItem.measureIdentifier,
                            );
                        }
                        // filter out invalid column attribute locators
                        return includes(
                            columnAttributeLocalIdentifiers,
                            locator.attributeLocatorItem.attributeIdentifier,
                        );
                    }),
                },
            };

            // keep sortItem if measureLocator is present and locators are correct length
            if (
                filteredSortItem.measureSortItem.locators.some(locator =>
                    AFM.isMeasureLocatorItem(locator),
                ) &&
                filteredSortItem.measureSortItem.locators.length ===
                    columnAttributeLocalIdentifiers.length + 1
            ) {
                return [...sortItems, filteredSortItem];
            }

            // otherwise just carry over previous sortItems
            return sortItems;
        }
        if (includes(attributeLocalIdentifiers, sortItem.attributeSortItem.attributeIdentifier)) {
            return [...sortItems, sortItem];
        }
        return sortItems;
    }, []);
}

export function adaptReferencePointSortItemsToPivotTable(
    originalSortItems: AFM.SortItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
): AFM.SortItem[] {
    const measureLocalIdentifiers = measures.map(measure => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map(rowAttribute => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        columnAttribute => columnAttribute.localIdentifier,
    );

    return adaptSortItemsToPivotTable(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

const bucketItemGetter = <T extends VisualizationObject.BucketItem>(bucketId: string) => (
    buckets: VisualizationObject.IBucket[],
) => flatMap(buckets.filter(b => b.localIdentifier === bucketId), i => i.items) as T[];

const getMeasures = bucketItemGetter<VisualizationObject.IMeasure>(BucketNames.MEASURES);
const getRows = bucketItemGetter<VisualizationObject.IVisualizationAttribute>(BucketNames.ATTRIBUTE);
const getColumns = bucketItemGetter<VisualizationObject.IVisualizationAttribute>(BucketNames.COLUMNS);

function adaptMdObjectSortItemsToPivotTable(
    originalSortItems: AFM.SortItem[],
    buckets: VisualizationObject.IBucket[],
): AFM.SortItem[] {
    const measureLocalIdentifiers = getMeasures(buckets).map(measure => measure.measure.localIdentifier);
    const rowAttributeLocalIdentifiers = getRows(buckets).map(
        rowAttribute => rowAttribute.visualizationAttribute.localIdentifier,
    );
    const columnAttributeLocalIdentifiers = getColumns(buckets).map(
        columnAttribute => columnAttribute.visualizationAttribute.localIdentifier,
    );

    return adaptSortItemsToPivotTable(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

const isAttributeSortItemVisible = (_sortItem: AFM.IAttributeSortItem, _filters: IBucketFilter[]): boolean =>
    true;

const isMeasureSortItemMatchedByFilter = (
    sortItem: AFM.IMeasureSortItem,
    filter: IAttributeFilter,
): boolean =>
    filter.selectedElements.some(selectedElement =>
        sortItem.measureSortItem.locators.some(
            locator =>
                !AFM.isMeasureLocatorItem(locator) &&
                locator.attributeLocatorItem.element === selectedElement.uri,
        ),
    );

const isMeasureSortItemVisible = (sortItem: AFM.IMeasureSortItem, filters: IBucketFilter[]): boolean =>
    filters.reduce((isVisible, filter) => {
        if (isAttributeFilter(filter)) {
            const shouldBeMatched = !filter.isInverted;
            return isVisible && shouldBeMatched === isMeasureSortItemMatchedByFilter(sortItem, filter);
        }
        return isVisible;
    }, true);

export const isSortItemVisible = (sortItem: AFM.SortItem, filters: IBucketFilter[]): boolean =>
    AFM.isAttributeSortItem(sortItem)
        ? isAttributeSortItemVisible(sortItem, filters)
        : isMeasureSortItemVisible(sortItem, filters);

export function addDefaultSort(
    sortItems: AFM.SortItem[],
    filters: IBucketFilter[],
    rowAttributes: IBucketItem[],
    previousRowAttributes?: IBucketItem[],
): AFM.SortItem[] {
    // cannot construct default sort without a row
    if (rowAttributes.length < 1) {
        return sortItems;
    }

    // detect custom sort
    const firstRow = rowAttributes[0];
    const previousFirstRow = previousRowAttributes && previousRowAttributes[0];
    const hasVisibleCustomSort = sortItems.some(sortItem => {
        if (!isSortItemVisible(sortItem, filters)) {
            return false;
        }
        // non attribute sort is definitely custom
        if (!AFM.isAttributeSortItem(sortItem)) {
            return true;
        }
        // asc sort on first row is considered default
        if (
            sortItem.attributeSortItem.attributeIdentifier === firstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        // asc sort on row that was first until now is considered default as well
        if (
            previousFirstRow &&
            sortItem.attributeSortItem.attributeIdentifier === previousFirstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        return true;
    });

    return hasVisibleCustomSort
        ? sortItems
        : [
              {
                  attributeSortItem: {
                      attributeIdentifier: firstRow.localIdentifier,
                      direction: "asc",
                  },
              },
          ];
}

export class PluggablePivotTable extends AbstractPluggableVisualization {
    private projectId: string;
    private element: string;
    private configPanelElement: string;
    private callbacks: IVisCallbacks;
    private intl: IntlShape;
    private visualizationProperties: IVisualizationProperties;
    private locale: ILocale;
    private environment: VisualizationEnvironment;
    private featureFlags: IFeatureFlags;

    constructor(props: IVisConstruct) {
        super();
        this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.callbacks = props.callbacks;
        this.locale = props.locale || DEFAULT_LOCALE;
        this.intl = createInternalIntl(this.locale);
        this.onExportReady = props.callbacks.onExportReady && this.onExportReady.bind(this);
        this.environment = props.environment;
        this.featureFlags = props.featureFlags || {};
        this.onColumnResized = this.onColumnResized.bind(this);
        this.handlePushData = this.handlePushData.bind(this);
        this.supportedPropertiesList = PIVOT_TABLE_SUPPORTED_PROPERTIES;
    }

    public unmount() {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
    }

    public update(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        this.visualizationProperties = visualizationProperties;
        this.renderVisualization(options, visualizationProperties, mdObject);
        this.renderConfigurationPanel(mdObject);
    }

    public getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        return Promise.resolve(
            produce<IExtendedReferencePoint>(
                referencePoint as IExtendedReferencePoint,
                referencePointDraft => {
                    referencePointDraft.uiConfig = cloneDeep(DEFAULT_PIVOT_TABLE_UICONFIG);

                    const buckets = referencePointDraft.buckets;
                    const measures = getAllItemsByType(buckets, [METRIC]);
                    const rowAttributes = getRowAttributes(buckets);
                    const previousRowAttributes =
                        previousReferencePoint && getRowAttributes(previousReferencePoint.buckets);

                    const columnAttributes = getColumnAttributes(buckets);
                    const previousColumnAttributes =
                        previousReferencePoint && getColumnAttributes(previousReferencePoint.buckets);

                    const totals = getTotalsFromBucket(buckets, BucketNames.ATTRIBUTE);

                    referencePointDraft.buckets = removeDuplicateBucketItems([
                        {
                            localIdentifier: BucketNames.MEASURES,
                            items: measures,
                        },
                        {
                            localIdentifier: BucketNames.ATTRIBUTE,
                            items: rowAttributes,
                            // This is needed because at the beginning totals property is
                            // missing from buckets. If we would pass empty array or
                            // totals: undefined, reference points would differ.
                            ...(totals.length > 0 ? { totals } : null),
                        },
                        {
                            localIdentifier: BucketNames.COLUMNS,
                            items: columnAttributes,
                        },
                    ]);

                    const filters: IBucketFilter[] = referencePointDraft.filters
                        ? flatMap(referencePointDraft.filters.items, item => item.filters)
                        : [];

                    const originalSortItems: AFM.SortItem[] = get(
                        referencePointDraft.properties,
                        "sortItems",
                        [],
                    );
                    const originalColumnWidths: ColumnWidthItem[] = get(
                        referencePointDraft.properties,
                        "controls.columnWidths",
                        [],
                    );
                    const columnWidths = adaptReferencePointWidthItemsToPivotTable(
                        originalColumnWidths,
                        measures,
                        rowAttributes,
                        columnAttributes,
                        previousRowAttributes ? previousRowAttributes : [],
                        previousColumnAttributes ? previousColumnAttributes : [],
                        filters,
                    );
                    const controlsObj =
                        this.featureFlags.enableTableColumnsManualResizing || columnWidths.length > 0
                            ? {
                                  controls: {
                                      columnWidths,
                                  },
                              }
                            : {};

                    referencePointDraft.properties = {
                        sortItems: addDefaultSort(
                            adaptReferencePointSortItemsToPivotTable(
                                originalSortItems,
                                measures,
                                rowAttributes,
                                columnAttributes,
                            ),
                            filters,
                            rowAttributes,
                            previousRowAttributes,
                        ),
                        ...controlsObj,
                    };

                    setPivotTableUiConfig(referencePointDraft, this.intl, VisualizationTypes.TABLE);
                    configurePercent(referencePointDraft, false);
                    configureOverTimeComparison(referencePointDraft, !!this.featureFlags.enableWeekFilters);
                    Object.assign(
                        referencePointDraft,
                        getReferencePointWithSupportedProperties(
                            referencePointDraft,
                            this.supportedPropertiesList,
                        ),
                    );
                    referencePointDraft.filters = sanitizeFilters(referencePointDraft).filters;
                },
            ),
        );
    }

    public getExtendedPivotTableProps(
        pivotTableProps: IPivotTableProps,
        config: IPivotTableConfig,
    ): IPivotTableProps {
        return {
            ...pivotTableProps,
            config,
        };
    }

    protected renderVisualization(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        const { dataSource } = options;

        if (dataSource) {
            const { resultSpec, locale, custom, dimensions, config } = options;
            const { height } = dimensions;
            const { drillableItems } = custom;
            const { afterRender, onError, onLoadingChanged, onDrill, onFiredDrillEvent } = this.callbacks;

            const resultSpecWithDimensions: AFM.IResultSpec = {
                ...resultSpec,
                dimensions: this.getDimensions(mdObject),
            };

            const sorts: AFM.SortItem[] = get(visualizationProperties, "sortItems", []) as AFM.SortItem[];

            const resultSpecWithSorts = resultSpecWithDimensions.sorts
                ? resultSpecWithDimensions
                : {
                      ...resultSpecWithDimensions,
                      sorts,
                  };

            const columnWidths: ColumnWidthItem[] = getColumnWidthsFromProperties(visualizationProperties);

            const rowsBucket = mdObject.buckets.find(
                bucket => bucket.localIdentifier === BucketNames.ATTRIBUTE,
            );
            const totals: VisualizationObject.IVisualizationTotal[] = (rowsBucket && rowsBucket.totals) || [];

            const updatedConfig = getTableConfigFromFeatureFlags(
                this.enrichConfigWithMenu(config),
                this.featureFlags,
                this.environment === DASHBOARDS_ENVIRONMENT,
                columnWidths,
            );
            const pivotTableProps = {
                projectId: this.projectId,
                drillableItems,
                onDrill,
                onFiredDrillEvent,
                totals,
                config: updatedConfig,
                height,
                locale,
                dataSource,
                resultSpec: resultSpecWithSorts,
                afterRender,
                onLoadingChanged,
                pushData: this.handlePushData,
                onError,
                onExportReady: this.onExportReady,
                LoadingComponent: null as any,
                ErrorComponent: null as any,
                intl: this.intl,
            };
            const pivotTablePropsFromFeatureFlags = {
                ...pivotTableProps,
                ...this.getPivotTablePropsFromFeatureFlags(),
            };

            if (this.environment === DASHBOARDS_ENVIRONMENT) {
                if (isNil(height)) {
                    render(
                        <ReactMeasure client={true}>
                            {({ measureRef, contentRect }: any) => {
                                const clientHeight = contentRect.client.height;
                                const usedHeight = Math.floor(clientHeight || 0);
                                const pivotWrapperStyle: React.CSSProperties = {
                                    height: "100%",
                                    textAlign: "left",
                                };
                                const extendedPivotTableProps = this.getExtendedPivotTableProps(
                                    pivotTablePropsFromFeatureFlags,
                                    {
                                        ...updatedConfig,
                                        maxHeight: clientHeight,
                                    },
                                );

                                return (
                                    <div
                                        ref={measureRef}
                                        style={pivotWrapperStyle}
                                        className="gd-table-dashboard-wrapper"
                                    >
                                        {this.createTable({ ...extendedPivotTableProps, height: usedHeight })}
                                    </div>
                                );
                            }}
                        </ReactMeasure>,
                        document.querySelector(this.element),
                    );

                    return;
                }
                render(
                    <ReactMeasure client={true}>
                        {({ measureRef, contentRect }: any) => {
                            const extendedPivotTableProps = this.getExtendedPivotTableProps(
                                pivotTablePropsFromFeatureFlags,
                                {
                                    ...updatedConfig,
                                    maxHeight: contentRect.client.height,
                                },
                            );

                            return (
                                <div
                                    ref={measureRef}
                                    style={{ height: 328, textAlign: "left" }}
                                    className="gd-table-dashboard-wrapper"
                                >
                                    {this.createTable(extendedPivotTableProps)}
                                </div>
                            );
                        }}
                    </ReactMeasure>,
                    document.querySelector(this.element),
                );
            } else {
                render(
                    this.createTable(pivotTablePropsFromFeatureFlags),
                    document.querySelector(this.element),
                );
            }
        }
    }

    protected createTable(props: IPivotTableProps) {
        return <PivotTable {...props} />;
    }

    protected onExportReady(exportResult: VisEvents.IExportFunction) {
        const { onExportReady } = this.callbacks;
        if (onExportReady) {
            onExportReady(exportResult);
        }
    }

    protected renderConfigurationPanel(mdObject: VisualizationObject.IVisualizationObjectContent) {
        if (document.querySelector(this.configPanelElement)) {
            const properties: IVisualizationProperties = get(
                this.visualizationProperties,
                "properties",
                {},
            ) as IVisualizationProperties;
            // we need to handle cases when attribute previously bearing the default sort is no longer available
            const sanitizedProperties = properties.sortItems
                ? {
                      ...properties,
                      sortItems: adaptMdObjectSortItemsToPivotTable(properties.sortItems, mdObject.buckets),
                  }
                : properties;

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.callbacks.pushData}
                    properties={sanitizedProperties}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
        return generateDimensions(mdObject, VisualizationTypes.TABLE);
    }

    private enrichConfigWithMenu(config: IPivotTableConfig): IPivotTableConfig {
        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            // Menu aggregations turned off in KD
            return config;
        }

        const menu: IMenu = {
            aggregations: true,
            aggregationsSubMenu: true,
        };
        return merge({ menu }, config);
    }

    private getMergedProperties(newProperties: any): IVisualizationProperties {
        const properties: IVisualizationProperties = get(
            this.visualizationProperties,
            "properties",
            {},
        ) as IVisualizationProperties;

        return {
            properties: {
                ...properties,
                ...newProperties,
            },
        };
    }

    private onColumnResized(columnWidths: ColumnWidthItem[]) {
        const { pushData } = this.callbacks;

        pushData(
            this.getMergedProperties({
                controls: {
                    columnWidths,
                },
            }),
        );
    }

    private handlePushData(data: any) {
        const { pushData } = this.callbacks;
        if (data && data.properties && data.properties.sortItems) {
            pushData(
                this.getMergedProperties({
                    sortItems: data.properties.sortItems,
                }),
            );
        } else {
            pushData(data);
        }
    }

    private getPivotTablePropsFromFeatureFlags() {
        if (this.featureFlags.enableTableColumnsManualResizing) {
            return {
                onColumnResized: this.onColumnResized,
            };
        }

        return {};
    }
}
