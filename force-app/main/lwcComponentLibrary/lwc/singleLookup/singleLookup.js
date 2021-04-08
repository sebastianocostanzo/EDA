import { LightningElement, api, track } from "lwc";

const INPUT_DELAY = 150;

const INPUT_CLASS = "slds-input slds-combobox__input";
const COMBOBOX_CLASS = "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click";
const CONTAINER_CLASS = "slds-combobox_container";
const COMBOBOX_FORM_ELEMENT_CLASS = "slds-combobox__form-element slds-input-has-icon";

const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
export default class SingleLookup extends LightningElement {
    focused = false;
    inputValue = "";
    value;
    optionIndex = -1;
    blurLock = false;

    @api required;
    @api label;
    @api removeLabel;
    @api placeholder;
    @api value;
    @track options;

    @api setOptions(optionsToSet) {
        this.options = optionsToSet;
        this.clearCurrentOption();
        this.value = undefined;

        if (!this.options) {
            return;
        }

        for (let i = 0; i < this.options.length; i++) {
            this.options[i].index = i;
        }
    }

    get isExpanded() {
        if (!this.focused || !this.options || !!this.value) {
            return false;
        }

        return true;
    }

    get activeDescendant() {
        if (!this.options || this.optionIndex === -1) {
            return undefined;
        }

        return this.options[this.optionIndex].label;
    }

    get showSearchLine() {
        return !!this.inputValue && !this.value;
    }

    get comboboxClass() {
        if (!this.focused) {
            return COMBOBOX_CLASS;
        }

        return COMBOBOX_CLASS + " slds-is-open";
    }

    get inputClass() {
        if (!this.focused) {
            return INPUT_CLASS;
        }

        return INPUT_CLASS + " slds-has-focus";
    }

    get containerClass() {
        if (!this.value) {
            return CONTAINER_CLASS;
        }
        return CONTAINER_CLASS + " slds-combobox_container";
    }

    get comboboxFormElementClass() {
        if (!this.value) {
            return COMBOBOX_FORM_ELEMENT_CLASS + " slds-input-has-icon_right";
        }
        return COMBOBOX_FORM_ELEMENT_CLASS + " slds-input-has-icon_left-right";
    }

    handleBlur() {
        if (this.blurLock) {
            return;
        }
        this.focused = false;
    }

    handleFocus() {
        this.focused = true;
        this.clearCurrentOption();
    }

    handleInput(event) {
        window.clearTimeout(this.delayTimeout);
        this.inputValue = event.target.value;

        if (!this.inputValue) {
            this.inputValue = undefined;
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.inputDelayTimeout = setTimeout(() => {
            if (!this.inputValue) {
                return;
            }

            this.dispatchSearchEvent(this.inputValue);
            //mutability is a good thing
            this.setOptions(JSON.parse(JSON.stringify(this.options)));
        }, INPUT_DELAY);
    }

    handleKeydown(event) {
        if (!this.options) {
            return;
        }

        switch (event.keyCode) {
            case KEY_ENTER:
                event.preventDefault();
                this.confirmSelection(this.optionIndex);
                break;
            case KEY_UP:
                event.preventDefault();
                this.selectOptionUp();
                break;
            case KEY_DOWN:
                event.preventDefault();
                this.selectOptionDown();
                break;
        }
    }

    handleMouseDown(event) {
        this.blurLock = true;
    }

    handleMouseUp(event) {
        this.blurLock = false;
        this.template.querySelector("input").focus();
    }

    handleOptionConfirm(event) {
        this.confirmSelection(event.detail);
    }

    handleOptionSelection(event) {
        this.setCurrentOption(event.detail);
    }

    handleRemoveButtonClick(event) {
        this.clearOptions();
        this.clearValues();
        this.clearCurrentOption();
    }

    selectOptionDown() {
        this.deactivateCurrentOption();

        if (this.optionIndex >= this.options.length - 1) {
            this.optionIndex = 0;
        } else {
            this.optionIndex++;
        }

        this.activateCurrentOption();
    }

    selectOptionUp() {
        this.deactivateCurrentOption();

        if (this.optionIndex <= 0) {
            this.optionIndex = this.options.length - 1;
        } else {
            this.optionIndex--;
        }

        this.activateCurrentOption();
    }

    confirmSelection(confirmOption) {
        if (this.confirmOption < 0) {
            return;
        }

        this.value = this.options[confirmOption];
        this.inputValue = this.options[confirmOption].label;
        this.dispatchChangeEvent();
    }

    clearValues() {
        this.value = undefined;
        this.inputValue = "";
    }

    clearOptions() {
        this.options = undefined;
    }

    clearCurrentOption() {
        this.optionIndex = -1;
    }

    setCurrentOption(optionIndex) {
        this.deactivateCurrentOption();
        this.optionIndex = optionIndex;
        this.activateCurrentOption();
    }

    activateCurrentOption() {
        if (this.optionIndex >= 0) {
            this.options[this.optionIndex].active = true;
        }
    }

    deactivateCurrentOption() {
        if (this.optionIndex >= 0) {
            this.options[this.optionIndex].active = undefined;
        }
    }

    dispatchSearchEvent(inputValue) {
        const searchEvent = new CustomEvent("search", {
            detail: inputValue,
        });
        this.dispatchEvent(searchEvent);
    }

    dispatchChangeEvent() {
        const changeEvent = new CustomEvent("inputchange", {
            detail: this.value,
        });
        this.dispatchEvent(changeEvent);
    }
}