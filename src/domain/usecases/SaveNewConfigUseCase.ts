import { promiseMap } from "data/dhis2-utils";
import { AutogenConfigRepository } from "domain/repositories/AutogenConfigRepository";
import _ from "lodash";
import log from "utils/log";
import { getKeys } from "utils/ts-utils";

export class MigrateAutogenConfigUseCase {
    constructor(private autogenConfigRepository: AutogenConfigRepository) {}

    async execute() {
        log.info("Migrating autogenerated-forms config from d2-reports namespace");

        const oldConfig = await this.autogenConfigRepository.getOldConfig();
        const { dataSets } = oldConfig;

        const dataSetCodes = getKeys(dataSets);
        const dsDetails = await this.autogenConfigRepository.getAllDataSets(dataSetCodes);

        const newConfig = await promiseMap(
            dsDetails,
            async dsDetail => await this.autogenConfigRepository.formatConfig(dsDetail, oldConfig)
        );

        _(newConfig).forEach(async dataSetConfig => {
            const dataSetCode = _.head(_.keys(dataSetConfig.dataSets)) ?? "";

            return await this.autogenConfigRepository.saveNewConfig(dataSetCode, dataSetConfig);
        });

        log.info("Migration complete");
    }
}
