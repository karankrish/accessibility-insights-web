// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getStoreStateMessage, Messages } from 'common/messages';
import { StoreNames } from 'common/stores/store-names';
import * as TelemetryEvents from 'common/telemetry-events';
import { ScanBasePayload, ScanCompletedPayload, ScanUpdatePayload } from 'injected/analyzers/analyzer';
import { capitalize } from 'lodash';

import { Interpreter } from '../interpreter';
import { TelemetryEventHandler } from '../telemetry/telemetry-event-handler';
import {
    AddFailureInstancePayload,
    AddResultDescriptionPayload,
    AssessmentActionInstancePayload,
    BaseActionPayload,
    ChangeInstanceSelectionPayload,
    ChangeInstanceStatusPayload,
    ChangeRequirementStatusPayload,
    EditFailureInstancePayload,
    OnDetailsViewOpenPayload,
    RemoveFailureInstancePayload,
    SelectRequirementPayload,
    ToggleActionPayload,
    UpdateVisibilityPayload,
} from './action-payloads';
import { AssessmentActions } from './assessment-actions';

const AssessmentMessages = Messages.Assessment;

export class AssessmentActionCreator {
    constructor(
        private readonly interpreter: Interpreter,
        private readonly assessmentActions: AssessmentActions,
        private readonly telemetryEventHandler: TelemetryEventHandler,
    ) {}

    public registerCallbacks(): void {
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.SelectTestRequirement, this.onSelectTestStep);
        this.interpreter.registerTypeToPayloadCallback(getStoreStateMessage(StoreNames.AssessmentStore), this.onGetAssessmentCurrentState);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.AssessmentScanCompleted, this.onAssessmentScanCompleted);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.StartOver, this.onStartOverAssessment);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.StartOverAllAssessments, this.onStartOverAllAssessments);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.ChangeStatus, this.onChangeAssessmentInstanceStatus);
        this.interpreter.registerTypeToPayloadCallback(
            AssessmentMessages.ChangeVisualizationState,
            this.onChangeAssessmentVisualizationState,
        );
        this.interpreter.registerTypeToPayloadCallback(
            AssessmentMessages.ChangeVisualizationStateForAll,
            this.onChangeVisualizationStateForAll,
        );
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.Undo, this.onUndoAssessmentInstanceStatusChange);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.ChangeRequirementStatus, this.onChangeManualRequirementStatus);
        this.interpreter.registerTypeToPayloadCallback(
            AssessmentMessages.UndoChangeRequirementStatus,
            this.onUndoChangeManualRequirementStatus,
        );
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.AddFailureInstance, this.onAddFailureInstance);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.AddResultDescription, this.onAddResultDescription);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.RemoveFailureInstance, this.onRemoveFailureInstance);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.EditFailureInstance, this.onEditFailureInstance);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.UpdateInstanceVisibility, this.onUpdateInstanceVisibility);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.PassUnmarkedInstances, this.onPassUnmarkedInstances);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.ScanUpdate, this.onScanUpdate);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.TrackingCompleted, this.onTrackingCompleted);
        this.interpreter.registerTypeToPayloadCallback(AssessmentMessages.ContinuePreviousAssessment, this.onContinuePreviousAssessment);
        this.interpreter.registerTypeToPayloadCallback(Messages.Visualizations.DetailsView.Select, this.onPivotChildSelected);
    }

    private onContinuePreviousAssessment = (payload: BaseActionPayload, tabId: number): void => {
        const eventName = TelemetryEvents.CONTINUE_PREVIOUS_ASSESSMENT;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.continuePreviousAssessment.invoke(tabId);
    };

    private onPassUnmarkedInstances = (payload: ToggleActionPayload, tabId: number): void => {
        const eventName = TelemetryEvents.PASS_UNMARKED_INSTANCES;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.updateTargetTabId.invoke(tabId);
        this.assessmentActions.passUnmarkedInstance.invoke(payload);
    };

    private onEditFailureInstance = (payload: EditFailureInstancePayload): void => {
        const eventName = TelemetryEvents.EDIT_FAILURE_INSTANCE;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.editFailureInstance.invoke(payload);
    };

    private onRemoveFailureInstance = (payload: RemoveFailureInstancePayload): void => {
        const eventName = TelemetryEvents.REMOVE_FAILURE_INSTANCE;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.removeFailureInstance.invoke(payload);
    };

    private onAddFailureInstance = (payload: AddFailureInstancePayload): void => {
        const eventName = TelemetryEvents.ADD_FAILURE_INSTANCE;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.addFailureInstance.invoke(payload);
    };

    private onAddResultDescription = (payload: AddResultDescriptionPayload): void => {
        this.assessmentActions.addResultDescription.invoke(payload);
    };

    private onChangeManualRequirementStatus = (payload: ChangeRequirementStatusPayload, tabId: number): void => {
        const eventName = TelemetryEvents.CHANGE_INSTANCE_STATUS;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.updateTargetTabId.invoke(tabId);
        this.assessmentActions.changeRequirementStatus.invoke(payload);
    };

    private onUndoChangeManualRequirementStatus = (payload: ChangeRequirementStatusPayload): void => {
        const eventName = TelemetryEvents.UNDO_REQUIREMENT_STATUS_CHANGE;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.undoRequirementStatusChange.invoke(payload);
    };

    private onUndoAssessmentInstanceStatusChange = (payload: AssessmentActionInstancePayload): void => {
        const eventName = TelemetryEvents.UNDO_TEST_STATUS_CHANGE;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.undoInstanceStatusChange.invoke(payload);
    };

    private onChangeAssessmentInstanceStatus = (payload: ChangeInstanceStatusPayload, tabId: number): void => {
        const eventName = TelemetryEvents.CHANGE_INSTANCE_STATUS;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.updateTargetTabId.invoke(tabId);
        this.assessmentActions.changeInstanceStatus.invoke(payload);
    };

    private onChangeAssessmentVisualizationState = (payload: ChangeInstanceSelectionPayload): void => {
        const eventName = TelemetryEvents.CHANGE_ASSESSMENT_VISUALIZATION_STATUS;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.changeAssessmentVisualizationState.invoke(payload);
    };

    private onChangeVisualizationStateForAll = (payload: ChangeInstanceSelectionPayload): void => {
        const eventName = TelemetryEvents.CHANGE_ASSESSMENT_VISUALIZATION_STATUS_FOR_ALL;
        this.telemetryEventHandler.publishTelemetry(eventName, payload);
        this.assessmentActions.changeAssessmentVisualizationStateForAll.invoke(payload);
    };

    private onStartOverAssessment = (payload: ToggleActionPayload): void => {
        this.assessmentActions.resetData.invoke(payload);
    };

    private onStartOverAllAssessments = (payload: ToggleActionPayload, tabId: number): void => {
        this.assessmentActions.resetAllAssessmentsData.invoke(tabId);
    };

    private onUpdateInstanceVisibility = (payload: UpdateVisibilityPayload): void => {
        this.assessmentActions.updateInstanceVisibility.invoke(payload);
    };

    private onAssessmentScanCompleted = (payload: ScanCompletedPayload<any>, tabId: number): void => {
        this.assessmentActions.updateTargetTabId.invoke(tabId);
        this.assessmentActions.scanCompleted.invoke(payload);
    };

    private onGetAssessmentCurrentState = (): void => {
        this.assessmentActions.getCurrentState.invoke(null);
    };

    private onSelectTestStep = (payload: SelectRequirementPayload): void => {
        this.assessmentActions.selectRequirement.invoke(payload);
        this.telemetryEventHandler.publishTelemetry(TelemetryEvents.SELECT_REQUIREMENT, payload);
    };

    private onScanUpdate = (payload: ScanUpdatePayload): void => {
        const telemetryEventName = 'ScanUpdate' + capitalize(payload.key);
        this.telemetryEventHandler.publishTelemetry(telemetryEventName, payload);
        this.assessmentActions.scanUpdate.invoke(payload);
    };

    private onTrackingCompleted = (payload: ScanBasePayload): void => {
        const telemetryEventName = 'TrackingCompleted' + capitalize(payload.key);
        this.telemetryEventHandler.publishTelemetry(telemetryEventName, payload);
        this.assessmentActions.trackingCompleted.invoke(payload);
    };

    private onPivotChildSelected = (payload: OnDetailsViewOpenPayload): void => {
        this.assessmentActions.updateSelectedPivotChild.invoke(payload);
    };
}
