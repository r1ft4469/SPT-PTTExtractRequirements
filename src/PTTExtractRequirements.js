"use strict";
const mod = require("../package.json");

const modName = mod.name;
const version = mod.version;
const locations = DatabaseServer.tables.locations;

class PTTExtractRequirements {
    constructor() {
        Logger.info(`Loading: ${mod.author}-${mod.name} ${mod.version}`);
        ModLoader.onLoad[this.mod] = this.load.bind(this);
    }
    load() {
        if (!globalThis.PathToTarkovAPI) {
            Logger.error(`=> ${this.modName}: PathToTarkovAPI not found, are you sure a version of PathToTarkov >= 2.5.0 is installed ?`);
            return;
        }

        const pttconfig = PathToTarkovAPI.getConfig();

        Logger.log(`[${modName} : ${version}] : Updating Locations in Database.`);
        for (let l in locations) {
            if (l !== "base") {
                for (let exit in locations[l].base.exits) {
                    if (locations[l].base.exits[exit].Name !== "EXFIL_Train") {
                        modExtract(l, exit, 0, 0, false, false);
                    }
                    else {
                        modExtract(l, exit, 0, 0, true, false);
                    }

                    let ExtractType = locations[l].base.exits[exit].PassageRequirement
                    let ExtractEnabled = false
                    if (l == 'laboratory') {
                        modExtract(l, exit, 100, 10, false, true, locations[l].base.exits[exit].EntryPoints);
                        continue;
                    }

                    if (!ExtractEnabled) {
                        for (let map in pttconfig.exfiltrations) {
                            if (map != l) {
                                continue;
                            }
                            for (let testexit in pttconfig.exfiltrations[map])
                            {
                                if (testexit == locations[l].base.exits[exit].Name) {
                                    ExtractEnabled = true;
                                }
                            }
                        }
                    }

                    let entrypoints = "";
                    if (`${locations[l].base.exits[exit].EntryPoints}` !== 'undefined') {
                        entrypoints = locations[l].base.exits[exit].EntryPoints;
                        for (let entryexit in locations[l].base.exits) {
                            if (`${locations[l].base.exits[entryexit].EntryPoints}` !== 'undefined') {
                                entrypoints = `${entrypoints},${locations[l].base.exits[entryexit].EntryPoints}`;
                            }

                        }
                    }
                    else {
                        for (let entryexit in locations[l].base.exits) {
                            if (`${locations[l].base.exits[entryexit].EntryPoints}` !== 'undefined') {
                                if (entrypoints == "") {
                                    entrypoints = `${locations[l].base.exits[entryexit].EntryPoints}`;
                                }
                                else {
                                    entrypoints = `${entrypoints},${locations[l].base.exits[entryexit].EntryPoints}`;
                                }

                            }
                        } 
                    }

                    if (ExtractEnabled) {
                        if (true && ExtractType === "ScavCooperation") {
                            modExtract(l, exit, 100, 10, true, true, entrypoints);
                        } else if (true && ExtractType === "TransferItem") {
                            modExtract(l, exit, 100, 10, false, true, entrypoints);
                        } else if (true && ExtractType === "Empty" && locations[l].base.exits[exit].RequiredSlot === "Backpack") {
                            modExtract(l, exit, 100, 10, false, true, entrypoints);
                        } else if (true && ExtractType === "Reference" && locations[l].base.exits[exit].Id === "Alpinist") {
                            modExtract(l, exit, 100, 10, false, true, entrypoints);
                        }
                        else {
                            modExtract(l, exit, 100, 10, false, true, entrypoints);
                        }
                    }               
                }   
            }
        }

        function modExtract(l, exit, chance, exfilTime, req, log, entry) {
            locations[l].base.exits[exit].Chance = chance;
            locations[l].base.exits[exit].PlayersCount = "0";
            locations[l].base.exits[exit].ExfiltrationTime = exfilTime;
            locations[l].base.exits[exit].Id = "";
            locations[l].base.exits[exit].Count = "0";
            locations[l].base.exits[exit].EntryPoints = entry;
            if (req) {
                locations[l].base.exits[exit].PassageRequirement = "None";
                locations[l].base.exits[exit].ExfiltrationType = "Individual";
                locations[l].base.exits[exit].RequirementTip = "";
            }
            if (log) {
                Logger.log(`[${modName} : ${version}] : ${l} : ${locations[l].base.exits[exit].Name}`, "green");
            }
        }
    }
}

module.exports.Mod = PTTExtractRequirements;