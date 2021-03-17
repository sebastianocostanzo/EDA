import { LightningElement, api, wire } from "lwc";
import stgErrorInsufficientAccess from "@salesforce/label/c.stgErrorInsufficientAccess";
import checkAccessForCurrentUser from "@salesforce/apex/EDASettingsController.checkAccessForCurrentUser";

export default class EDASettings extends LightningElement {
    @api pageReference;

    currentUserHasAccess = false;

    labelReference = {
        settingsNavigation: "Navigation Pane Here",
        stgErrorInsufficientAccess,
    };

    settingsPageToDisplay = {
        accountModelSettings: true,
        contactInformationSettings: true,
    };

    changePageToDisplay(pageName) {
        let settingsPageDisplay = {};
        settingsPageDisplay[pageName.toLowerCase()] = true;

        settingsPageToDisplay = settingsPageDisplay;
    }

    @wire(checkAccessForCurrentUser)
    currentUserHasAccessWire(result) {
        const { error, data } = result;
        if (data) {
            this.currentUserHasAccess = data;
        }
    }
}