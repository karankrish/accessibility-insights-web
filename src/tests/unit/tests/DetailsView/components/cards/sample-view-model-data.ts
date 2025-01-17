// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { UnifiedResult } from '../../../../../../common/types/store-data/unified-data-interface';
import { UnifiedRuleResult, UnifiedStatusResults } from '../../../../../../DetailsView/components/cards/failed-instances-section-v2';

export const exampleUnifiedResult: UnifiedResult = {
    uid: 'some-guid-here',
    status: 'fail',
    ruleId: 'image-alt',
    identifiers: {
        'css-selector': 'body img',
    },
    descriptors: {
        snippet: 'this is a sample snippet',
    },
    resolution: {
        'how-to-fix-web': {
            any: [
                'Element does not have an alt attribute',
                'aria-label attribute does not exist or is empty',
                'aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty',
            ],
            none: [],
            all: [],
        },
    },
};

export const exampleUnifiedRuleResult: UnifiedRuleResult = {
    id: 'some-rule',
    nodes: [exampleUnifiedResult],
    description: 'sample-description',
    url: 'sample-url',
    guidance: [],
};

export const exampleUnifiedStatusResults: UnifiedStatusResults = {
    pass: [],
    fail: [exampleUnifiedRuleResult],
    inapplicable: [],
    unknown: [],
};
