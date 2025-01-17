// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { InspectElementPayload, InspectFrameUrlPayload, OnDevToolOpenPayload } from 'background/actions/action-payloads';
import { DevToolsActionCreator } from 'background/actions/dev-tools-action-creator';
import { DevToolActions } from 'background/actions/dev-tools-actions';
import { TelemetryEventHandler } from 'background/telemetry/telemetry-event-handler';
import { getStoreStateMessage, Messages } from 'common/messages';
import { StoreNames } from 'common/stores/store-names';
import * as TelemetryEvents from 'common/telemetry-events';
import { IMock, Mock, MockBehavior, Times } from 'typemoq';

import { createActionMock, createInterpreterMock } from '../global-action-creators/action-creator-test-helpers';

describe('DevToolsActionCreatorTest', () => {
    const tabId: number = -1;
    let telemetryEventHandlerMock: IMock<TelemetryEventHandler>;

    beforeEach(() => {
        telemetryEventHandlerMock = Mock.ofType(TelemetryEventHandler, MockBehavior.Strict);
    });

    it('handles DevToolStatus message', () => {
        const payload: OnDevToolOpenPayload = {
            status: true,
        };

        const setDevToolsStateMock = createActionMock(payload.status);
        const actionsMock = createActionsMock('setDevToolState', setDevToolsStateMock.object);
        const interpreterMock = createInterpreterMock(Messages.DevTools.DevtoolStatus, payload, tabId);

        const newTestObject = new DevToolsActionCreator(interpreterMock.object, actionsMock.object, telemetryEventHandlerMock.object);

        newTestObject.registerCallbacks();

        setDevToolsStateMock.verifyAll();
    });

    it('handles GetState message', () => {
        const getCurrentStateMock = createActionMock(null);
        const actionsMock = createActionsMock('getCurrentState', getCurrentStateMock.object);
        const interpreterMock = createInterpreterMock(getStoreStateMessage(StoreNames.DevToolsStore), null, tabId);

        const newTestObject = new DevToolsActionCreator(interpreterMock.object, actionsMock.object, telemetryEventHandlerMock.object);

        newTestObject.registerCallbacks();

        getCurrentStateMock.verifyAll();
    });

    it('handles InspectFrameUrl message', () => {
        const payload: InspectFrameUrlPayload = {
            frameUrl: 'frame-url',
        };

        const setFrameUrlMock = createActionMock(payload.frameUrl);
        const actionsMock = createActionsMock('setFrameUrl', setFrameUrlMock.object);
        const interpreterMock = createInterpreterMock(Messages.DevTools.InspectFrameUrl, payload, tabId);

        const newTestObject = new DevToolsActionCreator(interpreterMock.object, actionsMock.object, telemetryEventHandlerMock.object);

        newTestObject.registerCallbacks();

        setFrameUrlMock.verifyAll();
    });

    it('handles InspectElement message', () => {
        const payload: InspectElementPayload = {
            target: ['target'],
        };

        telemetryEventHandlerMock
            .setup(publisher => publisher.publishTelemetry(TelemetryEvents.INSPECT_OPEN, payload))
            .verifiable(Times.once());

        const setInspectElementMock = createActionMock(payload.target);
        const actionsMock = createActionsMock('setInspectElement', setInspectElementMock.object);
        const interpreterMock = createInterpreterMock(Messages.DevTools.InspectElement, payload, tabId);

        const newTestObject = new DevToolsActionCreator(interpreterMock.object, actionsMock.object, telemetryEventHandlerMock.object);

        newTestObject.registerCallbacks();

        setInspectElementMock.verifyAll();
        telemetryEventHandlerMock.verifyAll();
    });

    function createActionsMock<ActionName extends keyof DevToolActions>(
        actionName: ActionName,
        action: DevToolActions[ActionName],
    ): IMock<DevToolActions> {
        const actionsMock = Mock.ofType<DevToolActions>();
        actionsMock.setup(actions => actions[actionName]).returns(() => action);
        return actionsMock;
    }
});
