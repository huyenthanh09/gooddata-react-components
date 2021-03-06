// (C) 2020 GoodData Corporation
import includes = require("lodash/includes");

import {
    ColumnWidthItem,
    IMeasureColumnWidthItem,
    IAttributeColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureLocatorItem,
    isMeasureColumnWidthItem,
} from "../../../../interfaces/PivotTable";

import {
    IAttributeFilter,
    IBucketFilter,
    isAttributeFilter,
    IBucketItem,
} from "../../../interfaces/Visualization";

const matchesAttributeColumnWidthItemFilters = (
    _widthItem: IAttributeColumnWidthItem,
    _filters: IBucketFilter[],
): boolean => true;

const isMeasureWidthItemMatchedByFilter = (
    widthItem: IMeasureColumnWidthItem,
    filter: IAttributeFilter,
): boolean =>
    filter.selectedElements.some(selectedElement =>
        widthItem.measureColumnWidthItem.locators.some(
            locator =>
                !isMeasureLocatorItem(locator) &&
                locator.attributeLocatorItem.element === selectedElement.uri,
        ),
    );

const matchesMeasureColumnWidthItemFilters = (
    widthItem: IMeasureColumnWidthItem,
    filters: IBucketFilter[],
): boolean =>
    filters.reduce((isMatching, filter) => {
        if (isAttributeFilter(filter)) {
            const shouldBeMatched = !filter.isInverted;
            return isMatching && shouldBeMatched === isMeasureWidthItemMatchedByFilter(widthItem, filter);
        }
        return isMatching;
    }, true);

const matchesWidthItemFilters = (widthItem: ColumnWidthItem, filters: IBucketFilter[]): boolean =>
    isAttributeColumnWidthItem(widthItem)
        ? matchesAttributeColumnWidthItemFilters(widthItem, filters)
        : matchesMeasureColumnWidthItemFilters(widthItem, filters);

const containsMeasureLocator = (widthItem: IMeasureColumnWidthItem): boolean =>
    widthItem.measureColumnWidthItem.locators.some(locator => isMeasureLocatorItem(locator));

const widthItemLocatorsHaveProperLength = (
    widthItem: IMeasureColumnWidthItem,
    measuresCount: number,
    columnAttributesCount: number,
): boolean => {
    const widthItemLocatorsLength = widthItem.measureColumnWidthItem.locators.length;
    const hasWidthItemLocators = widthItemLocatorsLength > 0;
    const hasMeasureLocators = measuresCount > 0 && containsMeasureLocator(widthItem);
    const hasNotMeasureLocators = measuresCount === 0 && !containsMeasureLocator(widthItem);
    const widthItemLocatorsMatchesColumnAttributesLength =
        widthItemLocatorsLength === columnAttributesCount + 1;
    const widthItemLocatorsHasLengthAsColumnAttributesLength =
        widthItemLocatorsLength === columnAttributesCount;
    const locatorsMatchesLength = hasMeasureLocators && widthItemLocatorsMatchesColumnAttributesLength;
    const locatorsAreEmpty = hasNotMeasureLocators && widthItemLocatorsHasLengthAsColumnAttributesLength;

    return hasWidthItemLocators && (locatorsMatchesLength || locatorsAreEmpty);
};

function removeInvalidLocators(
    columnWidth: IMeasureColumnWidthItem,
    measureLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
) {
    return columnWidth.measureColumnWidthItem.locators.filter(locator => {
        // filter out invalid measure locators
        if (isMeasureLocatorItem(locator)) {
            return includes(measureLocalIdentifiers, locator.measureLocatorItem.measureIdentifier);
        }
        // filter out invalid column attribute locators
        return includes(columnAttributeLocalIdentifiers, locator.attributeLocatorItem.attributeIdentifier);
    });
}

// removes attribute widthItems with invalid identifiers
// removes measure widthItems with invalid identifiers and invalid number of locators
function adaptWidthItemsToPivotTable(
    originalColumnWidths: ColumnWidthItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
    filters: IBucketFilter[],
): ColumnWidthItem[] {
    const attributeLocalIdentifiers = [...rowAttributeLocalIdentifiers, ...columnAttributeLocalIdentifiers];

    return originalColumnWidths.reduce((columnWidths: ColumnWidthItem[], columnWidth: ColumnWidthItem) => {
        if (isMeasureColumnWidthItem(columnWidth)) {
            const filteredMeasureColumnWidthItem: IMeasureColumnWidthItem = {
                measureColumnWidthItem: {
                    ...columnWidth.measureColumnWidthItem,
                    locators: removeInvalidLocators(
                        columnWidth,
                        measureLocalIdentifiers,
                        columnAttributeLocalIdentifiers,
                    ),
                },
            };

            // check the attribute elements vs filters
            // and proper locators length
            // TODO: ONE-4449 - which will create widthItems with empty locators
            if (
                matchesWidthItemFilters(filteredMeasureColumnWidthItem, filters) &&
                widthItemLocatorsHaveProperLength(
                    filteredMeasureColumnWidthItem,
                    measureLocalIdentifiers.length,
                    columnAttributeLocalIdentifiers.length,
                )
            ) {
                return [...columnWidths, filteredMeasureColumnWidthItem];
            }
        } else {
            if (
                includes(attributeLocalIdentifiers, columnWidth.attributeColumnWidthItem.attributeIdentifier)
            ) {
                return [...columnWidths, columnWidth];
            }
        }

        return columnWidths;
    }, []);
}

export function adaptReferencePointWidthItemsToPivotTable(
    originalColumnWidths: ColumnWidthItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
    previousColumnAttributes: IBucketItem[],
    filters: IBucketFilter[],
): ColumnWidthItem[] {
    const measureLocalIdentifiers = measures.map(measure => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map(rowAttribute => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        columnAttribute => columnAttribute.localIdentifier,
    );
    const previousRowAttributeLocalIdentifiers = previousRowAttributes.map(
        rowAttribute => rowAttribute.localIdentifier,
    );
    const previousColumnAttributeLocalIdentifiers = previousColumnAttributes.map(
        columnAttribute => columnAttribute.localIdentifier,
    );
    const filteredRowAttributeLocalIdentifiers = rowAttributeLocalIdentifiers.filter(
        rowAttributeLocalIdentifier =>
            !previousColumnAttributeLocalIdentifiers.includes(rowAttributeLocalIdentifier),
    );
    const filteredColumnAttributeLocalIdentifiers = columnAttributeLocalIdentifiers.filter(
        columnAttributeLocalIdentifier =>
            !previousRowAttributeLocalIdentifiers.includes(columnAttributeLocalIdentifier),
    );

    return adaptWidthItemsToPivotTable(
        originalColumnWidths,
        measureLocalIdentifiers,
        filteredRowAttributeLocalIdentifiers,
        filteredColumnAttributeLocalIdentifiers,
        filters,
    );
}
