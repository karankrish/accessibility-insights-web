// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BrowserAdapter } from 'common/browser-adapters/browser-adapter';
import { getStoreStateMessage, Messages } from 'common/messages';
import { StoreNames } from 'common/stores/store-names';
import { SWITCH_BACK_TO_TARGET } from 'common/telemetry-events';

import { Interpreter } from '../interpreter';
import { TelemetryEventHandler } from '../telemetry/telemetry-event-handler';
import { SwitchToTargetTabPayload } from './action-payloads';
import { TabActions } from './tab-actions';

export class TabActionCreator {
    constructor(
        private readonly interpreter: Interpreter,
        private readonly tabActions: TabActions,
        private readonly browserAdapter: BrowserAdapter,
        private readonly telemetryEventHandler: TelemetryEventHandler,
    ) {}

    public registerCallbacks(): void {
        this.interpreter.registerTypeToPayloadCallback(Messages.Tab.Update, payload => this.tabActions.tabUpdate.invoke(payload));
        this.interpreter.registerTypeToPayloadCallback(getStoreStateMessage(StoreNames.TabStore), () =>
            this.tabActions.getCurrentState.invoke(null),
        );
        this.interpreter.registerTypeToPayloadCallback(Messages.Tab.Remove, () => this.tabActions.tabRemove.invoke(null));
        this.interpreter.registerTypeToPayloadCallback(Messages.Tab.Change, payload => this.tabActions.tabChange.invoke(payload));
        this.interpreter.registerTypeToPayloadCallback(Messages.Tab.Switch, (payload, tabId) => this.onSwitchToTargetTab(payload, tabId));
        this.interpreter.registerTypeToPayloadCallback(Messages.Tab.VisibilityChange, payload =>
            this.tabActions.tabVisibilityChange.invoke(payload.hidden),
        );
    }

    private onSwitchToTargetTab(payload: SwitchToTargetTabPayload, tabId: number): void {
        this.browserAdapter.switchToTab(tabId);
        this.telemetryEventHandler.publishTelemetry(SWITCH_BACK_TO_TARGET, payload);
    }
}
