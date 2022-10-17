//
import React from "react";
import { withStyles } from "@material-ui/core";
import log from "loglevel";
import { errorCreator } from "capture-core-utils";
import { D2SectionContainer } from "./D2Section.container";

import {} from "../../metaData";

export const styles = () => ({
    containerCustomForm: {
        paddingTop: 10,
        paddingBottom: 10,
    },
});

class D2Form extends React.PureComponent {
    constructor(props) {
        super(props);
        this.name = "D2Form";
        this.sectionInstances = new Map();
    }

    validateFormIncludeSectionFailedFields(options) {
        let failedFormFields = [];
        const isValid = Array.from(this.sectionInstances.entries())
            .map(entry => entry[1])
            .every(sectionInstance => {
                const isHidden = sectionInstance.props.isHidden;
                if (isHidden) {
                    return true;
                }
                const sectionFieldsInstance = sectionInstance.sectionFieldsInstance;
                if (!sectionFieldsInstance) {
                    log.error(
                        errorCreator("could not get section fields instance")({
                            method: "validateFormReturningFailedFields",
                            object: this,
                            sectionInstance,
                        })
                    );
                    return false;
                }

                const sectionIsValid = sectionFieldsInstance.isValid(options);
                if (!sectionIsValid) {
                    failedFormFields = [...failedFormFields, ...sectionFieldsInstance.getInvalidFields()];
                }
                return sectionIsValid;
            });

        return {
            isValid,
            failedFields: failedFormFields,
        };
    }

    validateFormScrollToFirstFailedField(options) {
        const { isValid, failedFields } = this.validateFormIncludeSectionFailedFields(options);
        if (isValid) {
            return true;
        }

        const firstFailureInstance = failedFields.length > 0 ? failedFields[0].instance : null;
        firstFailureInstance && firstFailureInstance.goto && firstFailureInstance.goto();
        return false;
    }

    setSectionInstance(instance, id) {
        if (!instance) {
            if (this.sectionInstances.has(id)) {
                this.sectionInstances.delete(id);
            }
        } else {
            this.sectionInstances.set(id, instance);
        }
    }

    getFormId() {
        return this.props.id;
    }

    getFormBuilderId(sectionId) {
        return `${this.props.id}-${sectionId}`;
    }

    renderHorizontal = (section, passOnProps) => (
        <D2SectionContainer
            key={section.id}
            innerRef={sectionInstance => {
                this.setSectionInstance(sectionInstance, section.id);
            }}
            sectionMetaData={section}
            customForm={section.customForm}
            validationStrategy={this.props.formFoundation.validationStrategy}
            formId={this.getFormId()}
            formBuilderId={this.getFormBuilderId(section.id)}
            sectionId={section.id}
            {...passOnProps}
        />
    );
    renderVertical = (section, passOnProps, classes) => (
        <div
            data-test="d2-form-component"
            className={section.customForm ? classes.containerCustomForm : ""}
            key={section.id}
        >
            <D2SectionContainer
                innerRef={sectionInstance => {
                    this.setSectionInstance(sectionInstance, section.id);
                }}
                sectionMetaData={section}
                validationStrategy={this.props.formFoundation.validationStrategy}
                formId={this.getFormId()}
                formBuilderId={this.getFormBuilderId(section.id)}
                sectionId={section.id}
                {...passOnProps}
            />
        </div>
    );

    render() {
        const { formFoundation, id, classes, isFormInReduxStore, ...passOnProps } = this.props;
        const metaDataSectionsAsArray = Array.from(formFoundation.sections.entries()).map(entry => entry[1]);

        const sections = metaDataSectionsAsArray.map(section =>
            passOnProps.formHorizontal
                ? this.renderHorizontal(section, passOnProps)
                : this.renderVertical(section, passOnProps, classes)
        );

        return (
            <>
                {isFormInReduxStore
                    ? sections
                    : log.error(
                          errorCreator(
                              "In order for the component to render you must add a form id in the redux store. " +
                                  'The right reducer to do this is called "forms".'
                          )({
                              method: "D2Form.component",
                          })
                      )}
            </>
        );
    }
}

const D2FormWithRef = props => {
    const { formRef, ...passOnProps } = props;

    const handleRef = instance => {
        if (formRef) {
            formRef(instance);
        }
    };

    return <D2Form ref={handleRef} {...passOnProps} />;
};

export const D2FormComponent = withStyles(styles)(D2FormWithRef);
