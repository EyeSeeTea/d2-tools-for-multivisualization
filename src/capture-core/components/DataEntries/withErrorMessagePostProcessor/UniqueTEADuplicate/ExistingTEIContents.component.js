//
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import { Button } from "../../../Buttons";
import { CardList } from "../../../CardList";

const styles = {
    customDialogActions: {
        marginLeft: 4,
        marginRight: 4,
    },
};

const ExistingTEIContentsComponentPlain = ({
    attributeValues,
    teiId,
    dataElements,
    onCancel,
    programId,
    ExistingUniqueValueDialogActions,
    classes,
}) => {
    const items = [
        {
            id: teiId,
            values: attributeValues,
        },
    ];

    return (
        <React.Fragment>
            <DialogContent>
                <DialogTitle>{i18n.t("Registered person")}</DialogTitle>
                <CardList
                    currentProgramId={programId}
                    // $FlowFixMe
                    items={items}
                    dataElements={dataElements}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} secondary>
                    {i18n.t("Cancel")}
                </Button>
                {ExistingUniqueValueDialogActions && (
                    <div className={classes.customDialogActions}>
                        <ExistingUniqueValueDialogActions attributeValues={attributeValues} teiId={teiId} />
                    </div>
                )}
            </DialogActions>
        </React.Fragment>
    );
};

export const ExistingTEIContentsComponent = withStyles(styles)(ExistingTEIContentsComponentPlain);
