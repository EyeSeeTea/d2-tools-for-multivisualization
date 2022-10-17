//
/* eslint-disable react/no-array-index-key */
import React, { Component } from "react";
import FormControl from "@material-ui/core/FormControl";
import { Radio, colors, spacersNum } from "@dhis2/ui";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import { withStyles } from "@material-ui/core/styles";
import { singleOrientations } from "./singleSelectBoxes.const";

const styles = ({ typography, palette }) => ({
    label: typography.formFieldTitle,
    iconSelected: {
        fill: palette.secondary.main,
    },
    iconDeselected: {
        fill: colors.grey700,
    },
    checkbox: {
        marginTop: spacersNum.dp8,
        marginBottom: spacersNum.dp16,
    },
});

class SingleSelectBoxesPlain extends Component {
    constructor(props) {
        super(props);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.labelClasses = this.buildLabelClasses();
    }

    buildLabelClasses() {
        return {
            root: this.props.classes.label,
        };
    }

    getBoxes() {
        const { options, classes } = this.props;
        return options.map(({ text, value }, index) => (
            <Radio
                key={index}
                checked={this.isChecked(value)}
                label={text}
                name={`singleSelectBoxes-${index}`}
                onChange={e => {
                    this.handleOptionChange(e, value);
                }}
                value={value}
                className={classes.checkbox}
                dense
            />
        ));
    }

    handleOptionChange(e, value) {
        this.handleSingleSelectUpdate(e.checked, value);
    }

    handleSingleSelectUpdate(isChecked, value) {
        if (isChecked === false && !this.props.nullable) {
            return;
        }
        this.props.onBlur(isChecked ? value : null);
    }

    setCheckedStatusForBoxes() {
        const value = this.props.value;
        if (value || value === false || value === 0) {
            this.checkedValues = new Set().add(value);
        } else {
            this.checkedValues = null;
        }
    }

    isChecked(value) {
        return !!(this.checkedValues && this.checkedValues.has(value));
    }

    renderHorizontal() {
        return <FormGroup row>{this.getBoxes()}</FormGroup>;
    }

    renderVertical() {
        return <FormGroup>{this.getBoxes()}</FormGroup>;
    }

    renderBoxes() {
        const orientation = this.props.orientation;
        return orientation === singleOrientations.VERTICAL ? this.renderVertical() : this.renderHorizontal();
    }

    render() {
        const { label, required } = this.props;

        this.setCheckedStatusForBoxes();

        return (
            <div
                ref={containerInstance => {
                    this.materialUIContainerInstance = containerInstance;
                }}
            >
                <FormControl component="fieldset">
                    {(() => {
                        if (!label) {
                            return null;
                        }

                        return (
                            <FormLabel
                                component="label"
                                required={!!required}
                                classes={this.labelClasses}
                                focused={false}
                            >
                                {label}
                            </FormLabel>
                        );
                    })()}
                    {this.renderBoxes()}
                </FormControl>
            </div>
        );
    }
}

export const SingleSelectBoxes = withStyles(styles)(SingleSelectBoxesPlain);
