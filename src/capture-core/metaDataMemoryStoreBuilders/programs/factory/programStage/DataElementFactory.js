//
/* eslint-disable no-underscore-dangle */
import log from "loglevel";
import { errorCreator } from "capture-core-utils";

import { DataElement, DateDataElement, dataElementTypes } from "../../../../metaData";
import { buildIcon } from "../../../common/helpers";
import { OptionSetFactory } from "../../../common/factory";

export class DataElementFactory {
    static propertyNames = {
        NAME: "NAME",
        DESCRIPTION: "DESCRIPTION",
        SHORT_NAME: "SHORT_NAME",
        FORM_NAME: "FORM_NAME",
    };

    static _getDataElementType(cachedValueType) {
        const converters = {};

        return converters[cachedValueType] || cachedValueType;
    }

    constructor(cachedOptionSets, locale) {
        this.locale = locale;
        this.optionSetFactory = new OptionSetFactory(cachedOptionSets, locale);
    }

    _getDataElementTranslation(cachedDataElement, property) {
        return (
            this.locale &&
            cachedDataElement.translations[this.locale] &&
            cachedDataElement.translations[this.locale][property]
        );
    }

    // eslint-disable-next-line complexity
    async _setBaseProperties(dataElement, cachedProgramStageDataElement) {
        const cachedDataElement = cachedProgramStageDataElement.dataElement;
        dataElement.id = cachedDataElement.id;
        dataElement.name =
            this._getDataElementTranslation(cachedDataElement, DataElementFactory.propertyNames.NAME) ||
            cachedDataElement.displayName;
        dataElement.shortName =
            this._getDataElementTranslation(cachedDataElement, DataElementFactory.propertyNames.SHORT_NAME) ||
            cachedDataElement.displayShortName;
        dataElement.formName =
            this._getDataElementTranslation(cachedDataElement, DataElementFactory.propertyNames.FORM_NAME) ||
            cachedDataElement.displayFormName;
        dataElement.description =
            this._getDataElementTranslation(
                cachedDataElement,
                DataElementFactory.propertyNames.DESCRIPTION
            ) || cachedDataElement.description;
        dataElement.displayInForms = true;
        dataElement.displayInReports = cachedProgramStageDataElement.displayInReports;
        dataElement.compulsory = cachedProgramStageDataElement.compulsory;
        dataElement.disabled = false;
        dataElement.icon = buildIcon(cachedDataElement.style);
        dataElement.url = cachedDataElement.url;

        if (cachedDataElement.optionSet && cachedDataElement.optionSet.id) {
            dataElement.optionSet = await this.optionSetFactory.build(
                dataElement,
                cachedDataElement.optionSet.id,
                cachedProgramStageDataElement.renderOptionsAsRadio,
                cachedProgramStageDataElement.renderType &&
                    cachedProgramStageDataElement.renderType.DESKTOP &&
                    cachedProgramStageDataElement.renderType.DESKTOP.type,
                DataElementFactory._getDataElementType
            );
        }
    }

    async _buildBaseDataElement(cachedProgramStageDataElement, dataElementType) {
        const dataElement = new DataElement();
        dataElement.type = dataElementType;
        await this._setBaseProperties(dataElement, cachedProgramStageDataElement);
        return dataElement;
    }

    async _buildDateDataElement(cachedProgramStageDataElement) {
        const dateDataElement = new DateDataElement();
        dateDataElement.type = dataElementTypes.DATE;
        dateDataElement.allowFutureDate = cachedProgramStageDataElement.allowFutureDate;
        await this._setBaseProperties(dateDataElement, cachedProgramStageDataElement);
        return dateDataElement;
    }

    build(cachedProgramStageDataElement) {
        if (!cachedProgramStageDataElement.dataElement) {
            log.error(
                errorCreator("programStageDataElement does not contain a dataElement")({
                    programStageDataElement: cachedProgramStageDataElement,
                })
            );
            return null;
        }

        const dataElementType = DataElementFactory._getDataElementType(
            cachedProgramStageDataElement.dataElement.valueType
        );

        return dataElementType === dataElementTypes.DATE
            ? this._buildDateDataElement(cachedProgramStageDataElement)
            : this._buildBaseDataElement(cachedProgramStageDataElement, dataElementType);
    }
}
