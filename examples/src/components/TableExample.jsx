// (C) 2007-2019 GoodData Corporation
import React, { Component } from 'react';
import { Table, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

export class TableExample extends Component {
    onLoadingChanged(...params) {
    // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
    // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onError', ...params);
    }

    render() {
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifier'),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesAdRoyaltyIdentifier'),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesInitialFranchiseFeeIdentifier'),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifierOngoingRoyalty')
        ];

        const totals = [
            {
                measureIdentifier: 'franchiseFeesIdentifier',
                type: 'sum',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                type: 'max',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
                type: 'min',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
                type: 'avg',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                type: 'med',
                attributeIdentifier: 'month'
            },
            {
                measureIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
                type: 'nat',
                attributeIdentifier: 'month'
            }
        ];

        const attributes = [
            Model.attribute(monthDateIdentifier).localIdentifier('month')
        ];

        return (
            <div style={{ height: 300 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    totals={totals}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
					locale = "ja-JP"
                />
            </div>
        );
    }
}

export default TableExample;
