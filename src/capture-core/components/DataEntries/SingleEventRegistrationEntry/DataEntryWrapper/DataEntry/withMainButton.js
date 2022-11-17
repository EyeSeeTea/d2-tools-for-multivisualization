//
import * as React from "react";
import { connect } from "react-redux";
import i18n from "@dhis2/d2-i18n";
import Tooltip from "@material-ui/core/Tooltip";
import { newEventSaveTypes } from "./newEventSaveTypes";
import { getDataEntryKey } from "../../../../DataEntry/common/getDataEntryKey";
import {} from "../../../../../metaData";
import { SimpleSplitButton, Button } from "../../../../Buttons";
import { getDataEntryHasChanges } from "../../getNewEventDataEntryHasChanges";

const buttonTypes = {
    ...newEventSaveTypes,
    FINISH: "FINISH",
};

const buttonDefinitions = {
    [buttonTypes.SAVEANDADDANOTHER]: props => ({
        key: buttonTypes.SAVEANDADDANOTHER,
        text: i18n.t("Save and add another"),
        onClick: () => {
            props.onSave(newEventSaveTypes.SAVEANDADDANOTHER);
        },
    }),
    [buttonTypes.SAVEANDEXIT]: props => ({
        key: buttonTypes.SAVEANDEXIT,
        text: i18n.t("Save and exit"),
        onClick: () => {
            props.onSave(newEventSaveTypes.SAVEANDEXIT);
        },
    }),
    [buttonTypes.FINISH]: props => ({
        key: buttonTypes.FINISH,
        text: i18n.t("Finish"),
        onClick: () => {
            props.onCancel();
        },
    }),
    [buttonTypes.SAVEWITHOUTCOMPLETING]: props => ({
        key: buttonTypes.SAVEWITHOUTCOMPLETING,
        text: i18n.t("Save without completing"),
        onClick: () => {
            props.onSave(newEventSaveTypes.SAVEWITHOUTCOMPLETING);
        },
    }),
    [buttonTypes.SAVEANDCOMPLETE]: props => ({
        key: buttonTypes.SAVEANDCOMPLETE,
        text: i18n.t("Complete"),
        onClick: () => {
            props.onSave(newEventSaveTypes.SAVEANDCOMPLETE);
        },
    }),
};

const getMainButton = InnerComponent =>
    class MainButtonHOC extends React.Component {
        getButtonDefinition = type => buttonDefinitions[type](this.props);

        getFormHorizontalButtons = (dataEntryHasChanges, hasRecentlyAddedEvents) => {
            const buttons = [
                this.getButtonDefinition(buttonTypes.SAVEANDADDANOTHER),
                this.getButtonDefinition(buttonTypes.SAVEANDEXIT),
            ];

            return dataEntryHasChanges || !hasRecentlyAddedEvents
                ? buttons
                : [this.getButtonDefinition(buttonTypes.FINISH), ...buttons];
        };

        getFormVerticalButtons = (dataEntryHasChanges, hasRecentlyAddedEvents, saveTypes) => {
            const buttons = saveTypes
                ? // $FlowFixMe[missing-annot] automated comment
                  saveTypes.map(saveType => this.getButtonDefinition(saveType))
                : [
                      this.getButtonDefinition(buttonTypes.SAVEANDEXIT),
                      this.getButtonDefinition(buttonTypes.SAVEANDADDANOTHER),
                  ];
            return dataEntryHasChanges || !hasRecentlyAddedEvents
                ? buttons
                : [this.getButtonDefinition(buttonTypes.FINISH), ...buttons];
        };

        renderMultiButton = (buttons, hasWriteAccess) => {
            const primary = buttons[0];
            const secondaries = buttons.slice(1);
            return (
                <Tooltip title={!hasWriteAccess ? i18n.t("No write access") : ""}>
                    <div data-test="main-button">
                        <SimpleSplitButton
                            primary
                            disabled={!hasWriteAccess}
                            onClick={primary.onClick}
                            dropDownItems={secondaries}
                        >
                            {primary.text}
                        </SimpleSplitButton>
                    </div>
                </Tooltip>
            );
        };

        renderCreateNewButton = () => {
            const { text, ...buttonProps } = this.getButtonDefinition(buttonTypes.SAVEWITHOUTCOMPLETING);
            return (
                <div data-test="creat-new-button">
                    <Button {...buttonProps}>{text}</Button>
                </div>
            );
        };

        render() {
            const {
                saveTypes,
                dataEntryHasChanges,
                hasRecentlyAddedEvents,
                formHorizontal,
                onSave,
                finalInProgress,
                ...passOnProps
            } = this.props;
            const hasWriteAccess = this.props.formFoundation.access.data.write;
            const buttons = formHorizontal
                ? this.getFormHorizontalButtons(dataEntryHasChanges, hasRecentlyAddedEvents)
                : this.getFormVerticalButtons(dataEntryHasChanges, hasRecentlyAddedEvents, saveTypes);

            // $FlowFixMe[extra-arg] automated comment
            const mainButton = this.renderMultiButton(buttons, hasWriteAccess);
            return (
                // $FlowFixMe[cannot-spread-inexact] automated comment
                <InnerComponent
                    // $FlowFixMe[prop-missing] automated comment
                    ref={innerInstance => {
                        this.innerInstance = innerInstance;
                    }}
                    mainButton={mainButton}
                    formHorizontal={formHorizontal}
                    {...passOnProps}
                />
            );
        }
    };

const mapStateToProps = (state, props) => {
    const itemId = state.dataEntries && state.dataEntries[props.id] && state.dataEntries[props.id].itemId;
    const key = getDataEntryKey(props.id, itemId);
    const dataEntryHasChanges = getDataEntryHasChanges(state);
    const hasRecentlyAddedEvents =
        state.recentlyAddedEvents && Object.keys(state.recentlyAddedEvents).length > 0;
    return {
        saveTypes: state.newEventPage.saveTypes,
        finalInProgress: state.dataEntriesUI[key] && state.dataEntriesUI[key].finalInProgress,
        dataEntryHasChanges,
        hasRecentlyAddedEvents,
    };
};

const mapDispatchToProps = () => ({});

export const withMainButton = () => InnerComponent =>
    // $FlowFixMe[missing-annot] automated comment
    connect(mapStateToProps, mapDispatchToProps)(getMainButton(InnerComponent));
