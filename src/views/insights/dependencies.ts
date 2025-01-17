// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { loadTheme } from 'office-ui-fabric-react';
import * as ReactDOM from 'react-dom';

import { ChromeAdapter } from '../../common/browser-adapters/chrome-adapter';
import { initializeFabricIcons } from '../../common/fabric-icons';
import { ActionMessageDispatcher } from '../../common/message-creators/action-message-dispatcher';
import { ContentActionMessageCreator } from '../../common/message-creators/content-action-message-creator';
import { StoreActionMessageCreatorFactory } from '../../common/message-creators/store-action-message-creator-factory';
import { StoreProxy } from '../../common/store-proxy';
import { BaseClientStoresHub } from '../../common/stores/base-client-stores-hub';
import { StoreNames } from '../../common/stores/store-names';
import { TelemetryDataFactory } from '../../common/telemetry-data-factory';
import { TelemetryEventSource } from '../../common/telemetry-events';
import { UserConfigurationStoreData } from '../../common/types/store-data/user-configuration-store';
import { contentPages } from '../../content';
import { RendererDeps } from './renderer';

export const rendererDependencies: () => RendererDeps = () => {
    const browserAdapter = new ChromeAdapter();
    const url = new URL(window.location.href);
    const tabId = parseInt(url.searchParams.get('tabId'), 10);
    const actionMessageDispatcher = new ActionMessageDispatcher(browserAdapter.sendMessageToFrames, tabId);

    const telemetryFactory = new TelemetryDataFactory();

    const contentActionMessageCreator = new ContentActionMessageCreator(
        telemetryFactory,
        TelemetryEventSource.ContentPage,
        actionMessageDispatcher,
    );

    const store = new StoreProxy<UserConfigurationStoreData>(StoreNames[StoreNames.UserConfigurationStore], browserAdapter);
    const storesHub = new BaseClientStoresHub<any>([store]);
    const storeActionMessageCreatorFactory = new StoreActionMessageCreatorFactory(actionMessageDispatcher);
    const storeActionMessageCreator = storeActionMessageCreatorFactory.fromStores(storesHub.stores);

    return {
        dom: document,
        render: ReactDOM.render,
        initializeFabricIcons,
        loadTheme,
        contentProvider: contentPages,
        contentActionMessageCreator,
        storesHub,
        storeActionMessageCreator,
    };
};
