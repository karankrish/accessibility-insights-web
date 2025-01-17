// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { StoreNames } from '../../common/stores/store-names';
import { UnifiedScanResultStoreData } from '../../common/types/store-data/unified-data-interface';
import { UnifiedScanCompletedPayload } from '../actions/action-payloads';
import { UnifiedScanResultActions } from '../actions/unified-scan-result-actions';
import { BaseStoreImpl } from './base-store-impl';

export class UnifiedScanResultStore extends BaseStoreImpl<UnifiedScanResultStoreData> {
    constructor(private readonly unifiedScanResultActions: UnifiedScanResultActions) {
        super(StoreNames.UnifiedScanResultStore);
    }

    public getDefaultState(): UnifiedScanResultStoreData {
        const defaultValue: UnifiedScanResultStoreData = {
            results: null,
            rules: null,
        };

        return defaultValue;
    }

    protected addActionListeners(): void {
        this.unifiedScanResultActions.getCurrentState.addListener(this.onGetCurrentState);
        this.unifiedScanResultActions.scanCompleted.addListener(this.onScanCompleted);
    }

    private onScanCompleted = (payload: UnifiedScanCompletedPayload): void => {
        this.state.results = payload.scanResult;
        this.state.rules = payload.rules;
        this.emitChanged();
    };
}
